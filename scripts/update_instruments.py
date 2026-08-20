import gzip,json,os,requests
URL=os.getenv("UPSTOX_NSE_INSTRUMENT_URL","https://assets.upstox.com/market-quote/instruments/exchange/NSE.json.gz")
print("Downloading Upstox NSE instrument master...")
r=requests.get(URL,timeout=120); r.raise_for_status()
records=json.loads(gzip.decompress(r.content).decode("utf-8"))
rows=[]
for x in records:
    if x.get("segment")=="NSE_EQ" and x.get("instrument_type") in ("EQ","BE") and x.get("instrument_key") and x.get("trading_symbol"):
        rows.append({"symbol":x["trading_symbol"],"company":x.get("name") or x.get("short_name") or "",
                     "instrument_key":x["instrument_key"],"isin":x.get("isin"),"favourite":False})
rows=sorted({x["symbol"]:x for x in rows}.values(),key=lambda x:x["symbol"])
old={}
if os.path.exists("data/stocks.json"):
    try:
        for x in json.load(open("data/stocks.json",encoding="utf-8")):
            if x.get("symbol"): old[x["symbol"]]=x
    except Exception: pass
keep=("favourite","tags","thesis","entry","stop","target1","target2","level_watch","chartink","research","rsi_system")
for x in rows:
    p=old.get(x["symbol"],{})
    for k in keep:
        if k in p: x[k]=p[k]
if "JYOTICNC" in old:
    for x in rows:
        if x["symbol"]=="JYOTICNC": x["favourite"]=True
with open("data/stocks.json","w",encoding="utf-8") as f: json.dump(rows,f,indent=2)
print("NSE equity instruments:",len(rows))
print("Favourites preserved:",sum(1 for x in rows if x.get("favourite")))
