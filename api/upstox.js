const BASE = "https://api.upstox.com/v3";

function headers(token) {
  if (!token) throw new Error("UPSTOX_ACCESS_TOKEN is not configured");
  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`
  };
}

async function get(path, token) {
  const r = await fetch(BASE + path, {headers: headers(token)});
  const text = await r.text();
  if (!r.ok) throw new Error(`Upstox ${r.status}: ${text}`);
  return JSON.parse(text);
}

async function getOhlc(instrumentKey, token) {
  return get(`/market-quote/ohlc?instrument_key=${encodeURIComponent(instrumentKey)}&interval=1d`, token);
}

async function getDailyHistory(instrumentKey, toDate, fromDate, token) {
  let p = `/historical-candle/${encodeURIComponent(instrumentKey)}/days/1/${toDate}`;
  if (fromDate) p += `/${fromDate}`;
  return get(p, token);
}

module.exports = {getOhlc, getDailyHistory};
