const Spinner = require("cli-spinner").Spinner;
const dotenv = require("dotenv");
dotenv.config();
const IS_RUNNING_LOCALLY = process.env.IS_RUNNING_LOCALLY.toLowerCase() === "true";

function startCountdownSpinner(durationMins) {
  const spinner = new Spinner("Next check in %s seconds...");
  spinner.setSpinnerString("|/-\\");
  let countdownSecs = durationMins * 60;
  spinner.start();
  const updateSpinnerText = () => {
    spinner.setSpinnerTitle(`Next check in ${countdownSecs} seconds...`);
  };
  updateSpinnerText();
  const interval = setInterval(() => {
    countdownSecs--;
    updateSpinnerText();
    if (countdownSecs <= 0) {
      clearInterval(interval);
    }
  }, 1000);
  return spinner;
}

module.exports = {
  // Command line spinner to aid local testing
  startCountdownSpinner,
  // .env vars
  ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY,
  IS_RUNNING_LOCALLY: IS_RUNNING_LOCALLY,
  INTERVAL_DURATION_MINS: IS_RUNNING_LOCALLY ? 2000 : 5,
  NO_PAIRS_TO_FETCH: IS_RUNNING_LOCALLY ? 1 : 30,
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_POLLING_ON: process.env.TELEGRAM_POLLING_ON,
  TELEGRAM_ACTIVITY_TOPIC: process.env.TELEGRAM_ACTIVITY_TOPIC,
  // Swap token order if any of these appear first in pair
  SECONDARY_TOKENS: ["ETH", "WETH", "USDT", "USDC"],
  // Contract domains to ignore/exclude
  BANNED_CONTRACT_DOMAINS: ["www.cleeps.io"],
  EXCLUDED_DOMAINS: [
    "forum.zeppelin.solutions",
    "ethereum.github.io",
    "github.com/ethereum",
    "github.com/OpenZeppelin",
    "solidity.readthedocs.io",
    "diligence.consensys.net",
    "forum.openzeppelin.com",
    "eips.ethereum.org",
    "ethereum.org",
    "blog.openzeppelin.com",
    "eth.wiki",
  ]
}