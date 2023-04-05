const axios = require("axios");
const config = require("./config.js")

function createGraphQLQueryForTier(minLiq, maxLiq) {
    const now = Math.floor(Date.now() / 1000);
    const minutesAgo = now - config.INTERVAL_DURATION_MINS * 60;
    const query = `
        {
          pairs(
            first: ${config.NO_PAIRS_TO_FETCH}
            where: {
              reserveUSD_lt: ${maxLiq},
              reserveUSD_gt: ${minLiq},
              createdAtTimestamp_gt: ${minutesAgo},
              createdAtTimestamp_lt: ${now}
            }
            orderBy: createdAtTimestamp
            orderDirection: desc
          ) {
            id
            token0 {
              id
              symbol
            }
            token1 {
              id
              symbol
            }
            reserveUSD
            volumeUSD
            createdAtTimestamp
          }
          bundle(id: "1") {
            ethPrice
          }
        }
      `;
    // console.log('\n---------------------------------------------\nQUERY:\n'+query)
    return query;
  }
  
  async function getLatestPairsInTier(tier) {
    const query = createGraphQLQueryForTier(tier.minLiq, tier.maxLiq);
    const response = await axios.post(
      "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
      { query: query }
    );
    return response.data.data.pairs;
  }

module.exports = {
    getLatestPairsInTier
}