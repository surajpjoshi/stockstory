function avg(values) {
  const a = values.filter(Number.isFinite);
  return a.length ? a.reduce((sum, v) => sum + v, 0) / a.length : null;
}

function calculateAth(candles) {
  if (!Array.isArray(candles) || !candles.length) return null;

  const highs = candles
    .map(c => Number(c[2]))
    .filter(Number.isFinite);

  return highs.length ? Math.max(...highs) : null;
}

function calculate52WeekHigh(candles) {
  const recent = candles.slice(-252);

  const highs = recent
    .map(c => Number(c[2]))
    .filter(Number.isFinite);

  return highs.length ? Math.max(...highs) : null;
}

function calculate52WeekLow(candles) {
  const recent = candles.slice(-252);

  const lows = recent
    .map(c => Number(c[3]))
    .filter(Number.isFinite);

  return lows.length ? Math.min(...lows) : null;
}

function calculateAverageVolume(candles, periods = 20) {
  const recent = candles.slice(-periods);

  const volumes = recent
    .map(c => Number(c[5]))
    .filter(Number.isFinite);

  return avg(volumes);
}

function distanceFromHigh(current, high) {
  if (!Number.isFinite(current) || !Number.isFinite(high) || high <= 0) {
    return null;
  }

  return ((high - current) / high) * 100;
}

function distanceFromLow(current, low) {
  if (!Number.isFinite(current) || !Number.isFinite(low) || low <= 0) {
    return null;
  }

  return ((current - low) / low) * 100;
}

function buildMetrics({
  currentPrice,
  currentVolume,
  candles
}) {

  if (!Array.isArray(candles) || !candles.length) {
    return {
      currentPrice,
      currentVolume,
      error: "No historical candles returned by Upstox"
    };
  }

  /*
   * Candle format:
   *
   * [timestamp, open, high, low, close, volume, ...]
   */

  // The last historical candle can be today's incomplete candle.
  // For average volume we therefore use completed candles only.
  const completedCandles =
    candles.length > 1
      ? candles.slice(0, -1)
      : candles;

  const average20Volume =
    calculateAverageVolume(completedCandles, 20);

  const relativeVolume =
    average20Volume && currentVolume
      ? currentVolume / average20Volume
      : null;

  const volumeShocker =
    relativeVolume !== null &&
    relativeVolume >= 2;

  const yearlyHigh =
    calculate52WeekHigh(candles);

  const yearlyLow =
    calculate52WeekLow(candles);

  const ath =
    calculateAth(candles);

  const distance52WHigh =
    distanceFromHigh(
      currentPrice,
      yearlyHigh
    );

  const distance52WLow =
    distanceFromLow(
      currentPrice,
      yearlyLow
    );

  const distanceAth =
    distanceFromHigh(
      currentPrice,
      ath
    );

  return {

    currentPrice,

    currentVolume,

    average20Volume,

    relativeVolume,

    volumeShocker,

    yearlyHigh,

    yearlyLow,

    distanceFrom52WHighPct:
      distance52WHigh,

    distanceFrom52WLowPct:
      distance52WLow,

    near52WHigh:
      distance52WHigh !== null &&
      distance52WHigh <= 3,

    new52WHigh:
      distance52WHigh !== null &&
      currentPrice >= yearlyHigh,

    ath,

    distanceFromAthPct:
      distanceAth,

    nearAth:
      distanceAth !== null &&
      distanceAth <= 3,

    newAth:
      distanceAth !== null &&
      currentPrice >= ath,

    candlesUsed:
      candles.length,

    tradingDaysFor52W:
      Math.min(candles.length, 252)

  };
}

module.exports = {
  buildMetrics,
  calculateAth,
  calculate52WeekHigh,
  calculate52WeekLow,
  calculateAverageVolume
};
