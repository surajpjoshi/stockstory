# StockStory — Trading Command Center

This is V1 of a personal trading dashboard designed for GitHub Pages.

## Features in V1

- Favourite stocks
- Trading thesis / why I'm watching
- Setup and tags
- Entry / stop / targets
- Key level to watch
- Chartink / research links
- Add to RSI Trading System flag
- Trading journal
- Personal trading rules
- Responsive dashboard
- Browser localStorage for prototype data

## Deploy to GitHub Pages

1. Create an empty repository named `stockstory`.
2. Upload all files and folders from this project to the repository root.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Select `main` and `/ (root)`.
6. Save.
7. Open the generated GitHub Pages URL.

## Important

V1 intentionally does NOT contain Upstox API credentials or Telegram bot credentials.

The next phase should add a secure backend/API layer for:
- Upstox live prices
- WebSocket market feed
- price/technical alerts
- Telegram notifications
- RS Trading System synchronization

Do not put Upstox secrets or Telegram bot tokens in browser JavaScript or a public GitHub repository.

## Data model direction

The `data/stocks.json` file is the starting master-stock structure. Later, this can become the shared stock source for both StockStory and the RSI Trading System.
