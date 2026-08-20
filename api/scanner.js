function avg(a) {
  const x = a.filter(Number.isFinite);
  return x.length ? x.reduce((s,v)=>s+v,0)/x.length : null;
}

function calculateAth(candles) {
  const highs = candles.map(c=>Number(c[2])).filter(Number.isFinite);
  return highs.length ? Math.max(...highs) : null;
}

function calculateAverageVolume(candles, periods=20) {
  return avg(candles.slice(-periods).map(c=>Number(c[5])));
}

function distancePct(current, level) {
  return Number.isFinite(current) && Number.isFinite(level) && level
    ? ((level-current)/level)*100 : null;
}

function buildMetrics({currentPrice,currentVolume,yearlyHigh,yearlyLow,candles}) {
  // Exclude today's candle where possible because it is incomplete during market hours.
  const completed = candles.slice(0,-1);
  const avg20 = calculateAverageVolume(completed,20);
  const ath = calculateAth(candles);
  const rv = avg20 ? currentVolume/avg20 : null;
  const d52 = distancePct(currentPrice,yearlyHigh);
  const dath = distancePct(currentPrice,ath);

  return {
    currentPrice,
    currentVolume,
    average20Volume: avg20,
    relativeVolume: rv,
    volumeShocker: rv !== null && rv >= 2,
    yearlyHigh,
    yearlyLow,
    distanceFrom52WHighPct: d52,
    near52WHigh: d52 !== null && d52 <= 3,
    ath,
    distanceFromAthPct: dath,
    nearAth: dath !== null && dath <= 3,
    newAth: ath !== null && currentPrice >= ath
  };
}

module.exports = {buildMetrics};
