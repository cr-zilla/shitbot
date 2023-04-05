const config = require("./config.js");

function flipAndTidy(pair) {
    if (config.SECONDARY_TOKENS.includes(pair.token0.symbol)) {
        const tempToken = { ...pair.token0 };
        pair.token0 = { ...pair.token1 };
        pair.token1 = { ...tempToken };
    }
    // Remove any whitepsace from tickers
    pair.token0.symbol = pair.token0.symbol.trim();
    pair.token1.symbol = pair.token1.symbol.trim();
    pairSummary = "Logging: 💩 " + pair.token0.symbol + "-" + pair.token1.symbol + ` - $${Math.round(pair.reserveUSD/1000)}k liq.`;
    console.log(pairSummary);
    return(pair);
}

module.exports = {
    flipAndTidy
}