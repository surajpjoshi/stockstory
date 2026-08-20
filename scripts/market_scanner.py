import datetime,json,os,time
from urllib.parse import quote
import requests
TOKEN=os.environ.get("UPSTOX_TOKEN","").strip()
if not TOKEN: raise RuntimeError("UPSTOX_TOKEN GitHub secret is missing.")
BASE="https://api.upstox.com/v3"
HEAD={"Authorization":f"Bearer {TOKEN}","Accept":"application/json"}
BATCH=500
HIST_LIMIT=150
stocks=json.load(open("data/stocks.json",encoding="utf-8"))
def get(url,params=None,timeout=90):
    r=requests.get(url,headers=HEAD,params=params,timeout=timeout)
    if not r.ok: print("HTTP",r.status_code,r.text[:800])
    r.raise_for_status(); return r.json()
def quotes(keys):
    out={}
    for i in range(0,len(keys),BATCH):
        b=keys[i:i+BATCH]
        print(f"Quotes {i+1}-{i+len(b)} / {len(keys)}")
        out.update(get(f"{BASE}/market-quote/ohlc",{"instrument_key":",".join(b),"interval":"1d"}).get("data",{}))
        time.sleep(.15)
    return out
def qkey(k): return k.replace("|",":")
def history(k,to_date,from_date):
    u=f"{BASE}/historical-candle/{quote(k,safe='')}/days/1/{to_date}/{from_date}"
    r=requests.get(u,headers=HEAD,timeout=90)
    if not r.ok:
        print("History",k,r.status_code,r.text[:500]); return []
    return r.json().get("data",{}).get("candles",[]) or []
keys=[x["instrument_key"] for x in stocks if x.get("instrument_key")]
qs=quotes(keys)
rank=[]
for s in stocks:
    d=qs.get(qkey(s["instrument_key"])) or qs.get(s["instrument_key"]) or {}
    rank.append((float((d.get("live_ohlc") or {}).get("volume") or 0),s["instrument_key"]))
rank.sort(reverse=True)
fav={x["instrument_key"] for x in stocks if x.get("favourite")}
histkeys=list(dict.fromkeys(list(fav)+[k for _,k in rank[:HIST_LIMIT]]))
today=datetime.date.today(); start=today-datetime.timedelta(days=3650)
hist={}
for i,k in enumerate(histkeys,1):
    try: hist[k]=history(k,today.isoformat(),start.isoformat())
    except Exception as e: print("History failed",k,e)
    if i%25==0: print(f"Historical {i}/{len(histkeys)}")
    time.sleep(.05)
out={"updated":datetime.datetime.now(datetime.timezone.utc).isoformat(),"totalNSE":len(stocks),
     "historicalScanned":len(hist),"favourites":[x["symbol"] for x in stocks if x.get("favourite")],"stocks":[]}
for s in stocks:
    k=s["instrument_key"]; d=qs.get(qkey(k)) or qs.get(k) or {}; live=d.get("live_ohlc") or {}
    price=float(d.get("last_price") or live.get("close") or 0); volume=float(live.get("volume") or 0)
    c=hist.get(k,[]); vols=[float(x[5]) for x in c if len(x)>5 and x[5] is not None]
    avg=sum(vols[-20:])/len(vols[-20:]) if vols[-20:] else None
    rel=volume/avg if avg else None
    highs=[float(x[2]) for x in c if len(x)>2 and x[2] is not None]
    lows=[float(x[3]) for x in c if len(x)>3 and x[3] is not None]
    ath=max(highs) if highs else None; h52=max(highs[-252:]) if highs[-252:] else None; l52=min(lows[-252:]) if lows[-252:] else None
    da=(ath-price)/ath*100 if ath and price else None; d52=(h52-price)/h52*100 if h52 and price else None
    score=(2 if rel is not None and rel>=2 else 0)+(1 if da is not None and da<=3 else 0)+(1 if h52 and price>=h52 else 0)+(1 if s.get("favourite") else 0)
    tags=list(s.get("tags",[]))
    if rel is not None and rel>=2 and "Volume Shocker" not in tags: tags.insert(0,"Volume Shocker")
    if da is not None and da<=3 and "Near ATH" not in tags: tags.insert(0,"Near ATH")
    if h52 and price>=h52 and "52W High" not in tags: tags.insert(0,"52W High")
    out["stocks"].append({**s,"price":price,"high":live.get("high"),"low":live.get("low"),"volume":volume,
        "average20Volume":avg,"relativeVolume":rel,"volumeShocker":bool(rel is not None and rel>=2),
        "ath":ath,"distanceFromATH":da,"yearlyHigh":h52,"yearlyLow":l52,"distanceFrom52WHigh":d52,
        "nearATH":bool(da is not None and da<=3),"newATH":bool(ath and price>=ath),"setupScore":min(score,10),"tags":tags})
with open("data/market.json","w",encoding="utf-8") as f: json.dump(out,f,indent=2)
print(f"StockStory V2.1 complete: {len(stocks)} NSE stocks; {len(hist)} historical stocks.")
