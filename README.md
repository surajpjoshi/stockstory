# StockStory V2 — Upstox-ready Trading Command Center

V2 adds a secure backend architecture for Upstox market data, volume shockers, 52-week highs/lows, ATH calculation, and a scheduled scanner.

## Files
- `index.html`, `styles.css`, `app.js` — frontend
- `api/server.js` — Node/Express API
- `api/upstox.js` — Upstox V3 API wrapper
- `api/scanner.js` — volume / 52W / ATH calculations
- `data/stocks.json` — master stock list
- `.github/workflows/market-scan.yml` — scheduled scanner template

## Security
Set `UPSTOX_ACCESS_TOKEN` as a server environment variable. Never put it in browser JavaScript or commit it to GitHub.

## Metrics
- Volume shock = current volume / average 20 completed daily volumes
- 52W distance = (52W high - current price) / 52W high × 100
- ATH = maximum daily high in the historical candles returned by Upstox

The frontend remains GitHub Pages compatible. The backend should be deployed separately (Render, Railway, Cloud Run, etc.).
