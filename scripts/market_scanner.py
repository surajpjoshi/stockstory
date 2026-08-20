import os,json,requests,datetime,time
TOKEN=os.environ["UPSTOX_TOKEN"]; BASE="https://api.upstox.com/v3"; HEAD={"Authorization":f"Bearer {TOKEN}","Accept":"application/json"}
stocks=json.load(open("data/stocks.json")); CHUNK=500
# Full market quote is batched so we do not make one request per stock.
def get_quotes(keys):
    out={}
    for i in range(0,len(keys),CHUNK):
        batch=keys[i:i+CHUNK]
        r=requests.get(f"{BASE}/market-quote/ohlc",headers=HEAD,params={"instrument_key":",".join(batch),"interval":"1d"},timeout=60)
        r.raise_for_status()
        out.update(r.json().get("data",{}))
    return out
keys=[x["instrument_key"] for x in stocks if x.get("instrument_key")]
quotes=get_quotes(keys)
# Historical calls are deliberately limited in V2 to favourites + the top volume candidates.
# This keeps Actions practical while the full NSE universe gets live quotes every scan.
bykey={x["instrument_key"]:x for x in stocks}; candidates=[]
for k,d in quotes.items():
    live=d.get("live_ohlc") or {}; candidates.append((float(live.get("volume") or 0),k))
candidates=[k for _,k in sorted(candidates,reverse=True)[:150]]
favkeys={x["instrument_key"] for x in stocks if x.get("favourite")}
histkeys=list(dict.fromkeys(list(favkeys)+candidates))[:250]
today=datetime.date.today(); from_date=today-datetime.timedelta(days=3650)
def history(key):
    url=f"{BASE}/historical-candle/{requests.utils.quote(key,safe='')}/day/{today.isoformat()}/{from_date.isoformat()}"
    r=requests.get(url,headers=HEAD,timeout=60)
    return r.json().get("data",{}).get("candles",[]) if r.ok else []
hist={}
for n,k in enumerate(histkeys,1):
    try: hist[k]=history(k)
    except Exception as e: print("history failed",k,e)
    if n%25==0: print("historical",n,"/",len(histkeys))
    time.sleep(0.05)
out={"updated":datetime.datetime.now(datetime.timezone.utc).isoformat(),"totalNSE":len(stocks),"favourites":[x["symbol"] for x in stocks if x.get("favourite")],"stocks":[]}
for s in stocks:
    k=s.get("instrument_key"); d=quotes.get(k,{})
    live=d.get("live_ohlc") or {}; price=float(d.get("last_price") or live.get("close") or 0); volume=float(live.get("volume") or 0)
    candles=hist.get(k,[]); vols=[float(c[5]) for c in candles if len(c)>5 and c[5] is not None]
    avg20=sum(vols[-20:])/len(vols[-20:]) if vols[-20:] else None
    rel=volume/avg20 if avg20 else None
    highs=[float(c[2]) for c in candles if len(c)>2 and c[2] is not None]; lows=[float(c[3]) for c in candles if len(c)>3 and c[3] is not None]
    ath=max(highs) if highs else None; rh=highs[-252:] if highs else []; rl=lows[-252:] if lows else []
    h52=max(rh) if rh else None; l52=min(rl) if rl else None
    da=((ath-price)/ath*100) if ath and price else None; d52=((h52-price)/h52*100) if h52 and price else None
    score=0; tags=list(s.get("tags",[]))
    if rel is not None and rel>=2: score+=2; tags.insert(0,"Volume Shocker")
    if da is not None and da<=3: score+=1; tags.insert(0,"Near ATH")
    if h52 and price>=h52: score+=1; tags.insert(0,"52W High")
    if s.get("favourite"): score+=1
    out["stocks"].append({**s,"price":price,"high":live.get("high"),"low":live.get("low"),"volume":volume,"average20Volume":avg20,"relativeVolume":rel,"volumeShocker":bool(rel is not None and rel>=2),"ath":ath,"distanceFromATH":da,"yearlyHigh":h52,"yearlyLow":l52,"distanceFrom52WHigh":d52,"nearATH":bool(da is not None and da<=3),"newATH":bool(ath and price>=ath),"setupScore":min(score,10),"tags":tags})
with open("data/market.json","w") as f: json.dump(out,f,indent=2)
print("StockStory V2 scan complete:",len(out["stocks"]),"NSE stocks;",len(hist),"historical stocks")
