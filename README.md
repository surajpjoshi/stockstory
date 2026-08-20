# StockStory V2 — Full NSE Universe

Architecture:
GitHub Actions → Python → Upstox → JSON → GitHub Pages

No Render is required.

## Setup
1. Upload this entire folder to the repository root.
2. Add GitHub repository secret `UPSTOX_TOKEN` containing your Upstox Analytics Token.
3. Actions → StockStory V2 NSE Scanner → Run workflow.
4. GitHub Pages: Settings → Pages → Deploy from branch → root.
5. Open the site.

## What V2 does
- Refreshes the Upstox NSE equity instrument universe.
- Uses Upstox batched market quote requests for the full NSE equity universe.
- Calculates live price, day high/low and volume for all returned NSE equities.
- Calculates 20D average volume, relative volume, ATH and 52W metrics for favourites plus the top 150 volume candidates.
- Writes all results to `data/market.json`.
- Commits the updated JSON so GitHub Pages can display it.

Upstox recommends using `instrument_key` and its JSON instrument files for robust instrument identification. See:
https://upstox.com/developer/api-documentation/instruments/

Important: V2 intentionally limits historical requests. Calling historical data for every NSE stock every 15 minutes would be inefficient and may hit API limits. We can expand the historical scanner intelligently in V3.
