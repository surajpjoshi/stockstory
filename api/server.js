const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const { getOhlc, getDailyHistory } = require("./upstox");
const { buildMetrics } = require("./scanner");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const TOKEN = process.env.UPSTOX_ACCESS_TOKEN;

const stocksPath = path.join(
  __dirname,
  "..",
  "data",
  "stocks.json"
);


// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/health", (req, res) => {

  res.json({
    ok: true,
    service: "StockStory API",
    upstoxConfigured: Boolean(TOKEN),
    timestamp: new Date().toISOString()
  });

});


// =====================================================
// STOCK LIST
// =====================================================

app.get("/api/stocks", (req, res) => {

  try {

    const stocks = JSON.parse(
      fs.readFileSync(stocksPath, "utf8")
    );

    res.json(stocks);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});


// =====================================================
// UPSTOX QUOTE
// =====================================================

app.get("/api/quote", async (req, res) => {

  try {

    const instrumentKey = req.query.instrumentKey;

    if (!instrumentKey) {

      return res.status(400).json({
        error: "instrumentKey is required"
      });

    }

    const data = await getOhlc(
      instrumentKey,
      TOKEN
    );

    res.json(data);

  } catch (error) {

    console.error("Quote error:", error);

    res.status(500).json({
      error: error.message
    });

  }

});


// =====================================================
// STOCK METRICS
// =====================================================

app.get("/api/stock-metrics", async (req, res) => {

  try {

    const instrumentKey = req.query.instrumentKey;

    if (!instrumentKey) {

      return res.status(400).json({
        error: "instrumentKey is required"
      });

    }


    // -------------------------------------------------
    // CURRENT QUOTE
    // -------------------------------------------------

    const quote = await getOhlc(
      instrumentKey,
      TOKEN
    );


    // -------------------------------------------------
    // HISTORICAL DATA
    // -------------------------------------------------

    const today = new Date();

    const toDate =
      today.toISOString().slice(0, 10);

    const fromDate =
      new Date(
        today.getTime() -
        10 * 365 * 24 * 60 * 60 * 1000
      )
      .toISOString()
      .slice(0, 10);


    const history =
      await getDailyHistory(
        instrumentKey,
        toDate,
        fromDate,
        TOKEN
      );


    const candles =
      history?.data?.candles || [];


    // -------------------------------------------------
    // QUOTE EXTRACTION
    // -------------------------------------------------

    const quoteData =
      quote?.data
        ? Object.values(quote.data)[0]
        : {};


    const live =
      quoteData?.live_ohlc ||
      quoteData?.liveOHLC ||
      {};


    const currentPrice =
      Number(
        quoteData?.last_price ??
        quoteData?.ltp ??
        live?.close ??
        0
      );


    const currentVolume =
      Number(
        quoteData?.volume ??
        quoteData?.vtt ??
        live?.volume ??
        live?.vol ??
        0
      );


    const yearlyHigh =
      Number(
        quoteData?.yearly_high ??
        quoteData?.yh ??
        0
      );


    const yearlyLow =
      Number(
        quoteData?.yearly_low ??
        quoteData?.yl ??
        0
      );


    // -------------------------------------------------
    // CALCULATE METRICS
    // -------------------------------------------------

    const metrics =
      buildMetrics({

        currentPrice,

        currentVolume,

        yearlyHigh,

        yearlyLow,

        candles

      });


    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    res.json({

      success: true,

      instrumentKey,

      metrics,

      candlesCount: candles.length,

      generatedAt:
        new Date().toISOString()

    });


  } catch (error) {

    console.error(
      "Stock metrics error:",
      error
    );

    res.status(500).json({

      success: false,

      error: error.message

    });

  }

});


// =====================================================
// START SERVER
// =====================================================

app.listen(
  PORT,
  () => {

    console.log(
      `StockStory API running on port ${PORT}`
    );

  }
);
