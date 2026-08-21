# StockStory V1 — Simple Trading Journal & Watchlist

This version intentionally has no Upstox, Render, Python scanner, GitHub Actions, or API.

## Files

- `index.html` — page
- `styles.css` — dark StockStory theme
- `app.js` — watchlist, favourites, journal, CSV import/export
- `data/watchlist.json` — optional sample/reference data
- `data/journal.json` — optional sample/reference data

## Data storage

The browser uses localStorage so you can add and edit stocks immediately.

Use Export CSV regularly as a backup.

## CSV columns

`Symbol,Company,Sector,Setup,Level,Entry,StopLoss,Target,Chartink,TradingView,Why,Notes,Favourite`

Example:

`NSE:JYOTICNC,Jyoti CNC,Capital Goods,Trendline Breakout,975,980,900,1100,,,Trendline breakout,Watch volume,true`

## GitHub Pages

Upload/replace `index.html`, `styles.css`, and `app.js` in the repository and publish the `master` branch with GitHub Pages.


## Chartink
If Chartink URL is blank, StockStory automatically opens `https://chartink.com/stocks/<SYMBOL>.html` after removing the `NSE:` prefix. You can still enter a custom Chartink URL in Edit Stock.
