const config = require("./config.js");
const { sendTelegramMessageForPair } = require("./telegram.service.js");
const { TIERS } = require("./config-uniswap-tiers.js");
const { getTimeStamp } = require("./message-formatting.service.js");
const { flipAndTidy } = require("./pair-formatting.service.js");
const { getLatestPairsInTier } = require("./api-uniswap.js");

// Loop through each liquidity tier, get new pairs from Uniswap Subgraph, tidy and send to Telegram
async function monitorNewUniswapPairs() {
  for (const tier of TIERS) {
    try {
      const pairs = await getLatestPairsInTier(tier);
      for (const pair of pairs) {
        await sendTelegramMessageForPair(flipAndTidy(pair), tier);
      }
    } catch (error) {
      console.error("Error in tier processing:", error);
    }
  }
}

// Call the main function on startup so it runs immediately
monitorNewUniswapPairs().catch((error) => {
  console.error("Error:", error);
});

// Then rerun it every INTERVAL_DURATION_MINS
let spinner = config.startCountdownSpinner(config.INTERVAL_DURATION_MINS);

setInterval(async () => {
  if (spinner) {
    spinner.stop();
  }
  await monitorNewUniswapPairs().catch((error) => {
    console.error("Error:", error);
  });
  spinner = startCountdownSpinner(config.INTERVAL_DURATION_MINS);
}, config.INTERVAL_DURATION_MINS * 60 * 1000); // Convert minutes to milliseconds