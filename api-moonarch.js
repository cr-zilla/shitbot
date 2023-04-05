const axios = require("axios");

async function getLockedLiquidity(tokenId) {
    try {
      // Free API thus somewhat unreliable
      const apiURL = `https://api.moonarch.app/1.0/tokens/ETH/details/${tokenId}`;
      const response = await axios.get(apiURL, { timeout: 1000 });
      const data = response;
      let liquidityMessage = "";
  
      if (data.locks) {
        for (const lock of data.locks) {
          const startDate = new Date(lock.start * 1000).toLocaleDateString();
          const endDate = new Date(lock.end * 1000).toLocaleDateString();
          liquidityMessage += `\nLocked liq: ${lock.type} (<a href="https://etherscan.io/tx/${lock.hash}">tx hash</a>)\n`;
          liquidityMessage += `Start-End: ${startDate}-${endDate}\n`;
          // liquidityMessage += `Locked Amount: ${lockedAmount}`;
        }
      } else {
        liquidityMessage = `\nNo locked liq. found for <code>${tokenId}</code>\n`;
      }
      return liquidityMessage;
    } catch (error) {
      return "\nLocked liq. info: unavailable";
      console.error("\nMoonarch API timed out\n");
    }
  }

  module.exports = {
    getLockedLiquidity,
  }
