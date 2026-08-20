import os,json,requests
URL=os.getenv("UPSTOX_NSE_INSTRUMENT_URL","https://assets.upstox.com/market-quote/instruments/exchange/complete.json.gz")
r=requests.get(URL,timeout=120);r.raise_for_status()
import gzip,io
raw=gzip.decompress(r.content)
data=json.loads(raw)
rows=[{"symbol":x.get("trading_symbol"),"company":x.get("name"),"instrument_key":x.get("instrument_key"),"isin":x.get("isin")}
      for x in data if x.get("segment")=="NSE_EQ" and x.get("instrument_type")=="EQ" and x.get("instrument_key") and x.get("trading_symbol")]
rows=sorted({x["symbol"]:x for x in rows}.values(),key=lambda x:x["symbol"])
# Keep user's custom metadata where available.
old={}
if os.path.exists("data/stocks.json"):
    for x in json.load(open("data/stocks.json")): old[x.get("symbol")]=x
for x in rows:
    if x["symbol"] in old:
        x.update({k:v for k,v in old[x["symbol"]].items() if k not in ("symbol","instrument_key","company","isin")})
favs=[x for x in rows if x.get("favourite")]
if not any(x["symbol"]=="JYOTICNC" for x in rows):
    print("WARNING: JYOTICNC not found in instrument file")
with open("data/stocks.json","w") as f: json.dump(rows,f,indent=2)
print("NSE equities:",len(rows),"favourites:",len(favs))
