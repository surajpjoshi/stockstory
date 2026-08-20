import datetime,json,os,time
from urllib.parse import quote
import requests

TOKEN=os.environ.get("UPSTOX_TOKEN","").strip()
if not TOKEN:
    raise RuntimeError("UPSTOX_TOKEN GitHub secret is missing.")
BASE="https://api.upstox.com/v3"
HEAD={"Authorization":f"Bearer {TOKEN}","Accept":"application/json"}
PHASE_SIZE=1400
DELAY=0.14

stocks=json.load(open("data/stocks.json",encoding="utf-8"))
def history(key,to_date,from_date):
    url=f"{BASE}/historical-candle/{quote(key,safe='')}/days/1/{to_date}/{from_date}"
    r=requests.get(url,headers=HEAD,timeout=90)
    if r.status_code==429: raise RuntimeError("Upstox rate limit reached (429).")
    if not r.ok:
        print("History failed",key,r.status_code,r.text[:300]); return []
    return r.json().get("data",{}).get("candles",[]) or []

def metrics(candles):
    highs=[float(c[2]) for c in candles if len(c)>2 and c[2] is not None]
    lows=[float(c[3]) for c in candles if len(c)>3 and c[3] is not None]
    vols=[float(c[5]) for c in candles if len(c)>5 and c[5] is not None]
    if not highs: return {}
    return {
        "ath":max(highs),
        "yearlyHigh":max(highs[-252:]),
        "yearlyLow":min(lows[-252:]) if lows else None,
        "average20Volume":sum(vols[-20:])/len(vols[-20:]) if vols[-20:] else None,
        "historyDays":len(candles),
        "historyUpdated":datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

market=json.load(open("data/market.json",encoding="utf-8")) if os.path.exists("data/market.json") else {}
existing={x.get("instrument_key"):x for x in market.get("stocks",[]) if x.get("instrument_key")}
today=datetime.date.today(); from_date=today-datetime.timedelta(days=365)
phase=int(os.environ.get("HISTORY_PHASE","1"))
start=0 if phase==1 else PHASE_SIZE
end=min(len(stocks),PHASE_SIZE if phase==1 else len(stocks))
batch=stocks[start:end]
print(f"Historical phase {phase}: stocks {start+1}-{end} of {len(stocks)}")
updated=0
for n,s in enumerate(batch,1):
    key=s.get("instrument_key")
    if not key: continue
    c=history(key,today.isoformat(),from_date.isoformat())
    m=metrics(c)
    if m:
        row=existing.get(key,{"symbol":s["symbol"],"instrument_key":key})
        row.update(m); existing[key]=row; updated+=1
    if n%100==0: print(f"Progress {n}/{len(batch)}; updated {updated}")
    time.sleep(DELAY)

market["historicalUpdated"]=datetime.datetime.now(datetime.timezone.utc).isoformat()
market["historicalUniverse"]=len(stocks)
market["historicalPhase"]=phase
market["historicalUpdatedCount"]=updated
market["stocks"]=[existing[k] for k in [s.get("instrument_key") for s in stocks] if k in existing]
with open("data/market.json","w",encoding="utf-8") as f: json.dump(market,f,indent=2)
print(f"Historical phase {phase} complete. Updated {updated} stocks.")
