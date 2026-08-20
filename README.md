# StockStory — Start From Zero

Architecture:

GitHub Actions → Python → Upstox → data/market.json → GitHub Pages

No Render is required for this version.

## One-time setup

1. Upload the entire contents of this folder to your empty `stockstory` repo.
2. GitHub repo → Settings → Secrets and variables → Actions.
3. Add repository secret:
   - Name: `UPSTOX_TOKEN`
   - Value: your Upstox Analytics Token.
4. Go to Actions → StockStory Market Scanner → Run workflow.
5. After it succeeds, open the GitHub Pages website.

## Add stocks

Edit `data/stocks.json`. Each stock needs an Upstox instrument key.

Example:
`NSE_EQ|INE980O01024`

## GitHub Pages

Settings → Pages → Deploy from branch → `master` (or `main`) → `/ (root)`.

The scanner is intentionally small in V1. Next phases can add full NSE universe, RS integration, news, trendline detection, alerts and Telegram.
