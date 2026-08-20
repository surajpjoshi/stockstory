import os,json,requests,datetime
TOKEN=os.environ["UPSTOX_TOKEN"]
BASE="https://api.upstox.com/v3"
HEAD={"Authorization":f"Bearer {TOKEN}","Accept":"application/json"}
stocks=json.load(open("data/stocks.json"))
out={"updated":datetime.datetime.now(datetime.timezone.utc).isoformat(),"stocks":[]}
def get(url,params):
    r=requests.get(url,headers=HEAD,params=params,timeout=30)
    r.raise_for_status()
    return r.json()
for s in stocks:
    key=s["instrument_key"]
    q=get(f"{BASE}/market-quote/ohlc",{"instrument_key":key,"interval":"1d"})
    d=list(q.get("data",{}).values())[0]
    live=d.get("live_ohlc") or {}
    price=float(d.get("last_price") or live.get("close") or 0)
    candles=[]
    today=datetime.date.today()
    from_date=today-datetime.timedelta(days=3650)
    # Upstox V3 historical candle endpoint format
    url=f"{BASE}/historical-candle/{requests.utils.quote(key,safe='')}/day/{today.isoformat()}/{from_date.isoformat()}"
    h=requests.get(url,headers=HEAD,timeout=60)
    if h.ok:
        candles=h.json().get("data",{}).get("candles",[]) or []
    vols=[float(c[5]) for c in candles if len(c)>5 and c[5] is not None]
    avg20=sum(vols[-20:])/len(vols[-20:]) if vols[-20:] else None
    rel=float(live.get("volume") or 0)/avg20 if avg20 else None
    highs=[float(c[2]) for c in candles if len(c)>2 and c[2] is not None]
    lows=[float(c[3]) for c in candles if len(c)>3 and c[3] is not None]
    ath=max(highs) if highs else None
    recent=highs[-252:]
    recent_low=lows[-252:]
    high52=max(recent) if recent else None
    low52=min(recent_low) if recent_low else None
    dist_ath=((ath-price)/ath*100) if ath and price else None
    dist52=((high52-price)/high52*100) if high52 and price else None
    score=0
    tags=list(s.get("tags",[]))
    if rel is not None and rel>=2: score+=2; tags.insert(0,"Volume Shocker")
    if dist_ath is not None and dist_ath<=3: score+=1; tags.insert(0,"Near ATH")
    if high52 and price>=high52: score+=1; tags.insert(0,"52W High")
    out["stocks"].append({**s,"price":price,"high":live.get("high"),"low":live.get("low"),
        "volume":live.get("volume"),"average20Volume":avg20,"relativeVolume":rel,
        "volumeShocker":bool(rel is not None and rel>=2),"ath":ath,"distanceFromATH":dist_ath,
        "yearlyHigh":high52,"yearlyLow":low52,"distanceFrom52WHigh":dist52,
        "nearATH":bool(dist_ath is not None and dist_ath<=3),"newATH":bool(ath and price>=ath),
        "setupScore":min(score,10),"tags":tags})
with open("data/market.json","w") as f: json.dump(out,f,indent=2)
print("StockStory scan complete:",len(out["stocks"]))
