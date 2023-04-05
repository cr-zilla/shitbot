const moment = require("moment");
const config = require("./config.js");
const { getContractSourceCode } = require("./api-etherscan.js");

function getTimeStamp() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
  }

function formatPairMessage(pair) {
  return `💩${pair.token0.symbol}-${pair.token1.symbol} `;
}

function formatContractIDs(pair, emoji, targetToken) {
  // return `Liquidity: $${Math.round(pair.reserveUSD / 1000)}k | Vol: $${Math.round(pair.volumeUSD / 1000)}k\n`;
  return `${emoji}$${Math.round(
    pair.reserveUSD / 1000
  )}k liq.\nPair ID: <code>${
    pair.id
  }</code>\nToken ID: <code>${targetToken}</code>\n`;
}

function formatCreationInfo(pair) {
  const createdAt = moment.unix(pair.createdAtTimestamp);
  const createdAtFormatted = createdAt.format("DD/MM/YY HH:mm");
  const createdAtFromNow = createdAt.fromNow();
  return `Created: ${createdAtFormatted} (${createdAtFromNow})\n`;
}

async function getHttpsLinksFromContract(contractAddress) {
  const sourceCode = await getContractSourceCode(contractAddress);
  const regex = /(https:\/\/\S+)/g;
  const matches = sourceCode.match(regex) || [];
  const excludedDomains = config.EXCLUDED_DOMAINS;
  const filteredMatches = matches.filter((link) => {
    return !excludedDomains.some((excludedDomain) =>
      link.startsWith(`https://${excludedDomain}`)
    );
  });
  return filteredMatches;
}

function formatLinksInContract(pair) {
  return getHttpsLinksFromContract(pair.token0.id)
    .then((links) => {
      const linksHtml = links
        .map(
          (link) =>
            `<a href="${link}">${link
              .replace(/^https:\/\//i, "")
              .replace(/\/$/, "")}</a>`
        )
        .join(", ");
      return linksHtml.length > 0
        ? `Link(s) found in contract: ${linksHtml}\n`
        : "";
    })
    .catch((error) => {
      console.error(
        `Failed to retrieve HTTPS links from contract: ${error.message}`
      );
      return "";
    });
}

function formatSecurityMessage(pair, targetToken, targetSymbol, securityCheck) {
  let securityMessage = "";
  let apiResponseUrl =
    "https://api.gopluslabs.io/api/v1/token_security/1?contract_addresses=" +
    pair.token0.id;
  let apiResponseLink =
    "<a href='" + apiResponseUrl + "'>Raw GoPlusLabs security data.</a>";
  if (
    securityCheck.data.result[targetToken].honeypot_with_same_creator === "1"
  ) {
    securityMessage = `\n⚠️ The creator of ${pair.token0.symbol}-${pair.token1.symbol} has launched honeypots before!`;
  } else if (securityCheck.data.result[targetToken].is_honeypot === "1") {
    securityMessage = `\n⚠️ The contract for ${targetSymbol} is a honeypot!`;
  } else {
    securityMessage = `\n✅ Contract <a href=\"${apiResponseUrl}">seems ok</a> but DYOR`;
    // <a href="https://therugcheck.com/eth/?address=${pair.token0.id}">Rugcheck</a>
  }
  return securityMessage;
}

function formatTaxesAndTopHolders(targetToken, securityCheck) {
  const creator = securityCheck.data.result[targetToken].creator_address;
  const isAntiWhale =
    securityCheck.data.result[targetToken].is_anti_whale === "1" ? "Yes" : "No";
  const taxes = `Buy/Sell tax: ${(
    securityCheck.data.result[targetToken].buy_tax * 100
  ).toFixed(0)}% / ${(
    securityCheck.data.result[targetToken].sell_tax * 100
  ).toFixed(0)}%`;
  const top10Holders = securityCheck.data.result[targetToken].holders.slice(
    0,
    10
  );
  const totalPercentage = top10Holders.reduce(
    (sum, holder) => sum + parseFloat(holder.percent),
    0
  );
  const averagePercentage =
    (totalPercentage / top10Holders.length).toFixed(2) + "%";
  const creatorAddress =
    creator === undefined ? "unknown" : "<code>" + creator + "</code>";
  return `Anti-whale? ${isAntiWhale}\n${taxes}\nCreator address: ${creatorAddress}`;
  // return `Anti-whale? ${isAntiWhale}\nTop 10 wallets avg. holding: ${averagePercentage}\n${taxes}`;
}

module.exports = {
    getTimeStamp,
    formatPairMessage,
    formatContractIDs,
    formatCreationInfo,
    formatLinksInContract,
    formatSecurityMessage,
    formatTaxesAndTopHolders,
}