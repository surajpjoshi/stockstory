const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const {getOhlc,getDailyHistory} = require("./upstox");
const {buildMetrics} = require("./scanner");

const app=express();
app.use(cors());
app.use(express.json());
const PORT=process.env.PORT||3000;
const TOKEN=process.env.UPSTOX_ACCESS_TOKEN;
const stocksPath=path.join(__dirname,"..","data","stocks.json");

app.get("/health",(req,res)=>res.json({ok:true,upstoxConfigured:Boolean(TOKEN)}));

app.get("/api/stocks",(req,res)=>{
  res.json(JSON.parse(fs.readFileSync(stocksPath,"utf8")));
});

app.get("/api/quote/:instrumentKey(*)",async(req,res)=>{
  try { res.json(await getOhlc(req.params.instrumentKey,TOKEN)); }
  catch(e){ res.status(500).json({error:e.message}); }
});

app.get("/api/stock-metrics/:instrumentKey(*)",async(req,res)=>{
  try {
    const key=req.params.instrumentKey;
    const quote=await getOhlc(key,TOKEN);
    const to=new Date().toISOString().slice(0,10);
    const from=new Date(Date.now()-10*365*24*3600*1000).toISOString().slice(0,10);
    const history=await getDailyHistory(key,to,from,TOKEN);
    const candles=history?.data?.candles||[];
    const q=quote?.data ? Object.values(quote.data)[0] : {};
    const live=q?.live_ohlc||q?.liveOHLC||{};
    const price=Number(q?.last_price??q?.ltp??live?.close);
    const volume=Number(q?.volume??q?.vtt??live?.volume??live?.vol??0);
    const yh=Number(q?.yearly_high??q?.yh??0);
    const yl=Number(q?.yearly_low??q?.yl??0);
    res.json({instrumentKey:key,metrics:buildMetrics({
      currentPrice:price,currentVolume:volume,yearlyHigh:yh,yearlyLow:yl,candles
    })});
  } catch(e){ res.status(500).json({error:e.message}); }
});

app.listen(PORT,()=>console.log(`StockStory API running on ${PORT}`));
