const config = require("./config.js");
const { bot } = require('./config-telegram.bot.js');
const {
  formatPairMessage,
  formatContractIDs,
  formatCreationInfo,
  formatLinksInContract,
  formatSecurityMessage,
  formatTaxesAndTopHolders,
} = require("./message-formatting.service.js");
const { getLockedLiquidity } = require("./api-moonarch.js");
const {
  getGoLabsTokenSecurity,
} = require("./api-goplus.js");
const {
  buildInlineKeyboard
} = require("./telegram.keyboard.js");

async function sendTelegramMessageForPair(pair, tier) {
  targetToken = pair.token0.id;
  targetSymbol = pair.token0.symbol;
  const pairMessage = formatPairMessage(pair);
  const contractIds = formatContractIDs(pair, tier.emoji, targetToken);
  const creationInfo = formatCreationInfo(pair);
  const liquidityMessage = await getLockedLiquidity(targetToken);
  const linksInContract = await formatLinksInContract(pair);
  const securityCheck = await getGoLabsTokenSecurity(pair.token0.id)
  const hasBannedDomain = config.BANNED_CONTRACT_DOMAINS.some((domain) =>
    linksInContract.includes(domain)
  );
  if (
    securityCheck.data.result[targetToken] !== undefined &&
    !hasBannedDomain
  ) {
    const taxesAndTopHolders = formatTaxesAndTopHolders(
      targetToken,
      securityCheck
    );
    const securityMessage = formatSecurityMessage(
      pair,
      targetToken,
      targetSymbol,
      securityCheck
    );
    const telegramMessage = `${pairMessage}${contractIds}${creationInfo}${linksInContract}${taxesAndTopHolders}${liquidityMessage}${securityMessage}`;
    const inlineKeyboard = buildInlineKeyboard(pair);
    const options = {
      disable_web_page_preview: true,
      parse_mode: "HTML",
      reply_to_message_id: tier.topicId,
      resize_keyboard: false,
      reply_markup: { inline_keyboard: inlineKeyboard },
    };
    try {
      await bot.sendMessage(config.TELEGRAM_CHAT_ID, telegramMessage, options);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  } else {
    // if (securityCheck.data.result[targetToken] !== undefined) {
    //     // Allow for missing GoPlusLabs API response
    //     console.warn(`No security check data found for token ${targetToken}`);
    //     return;
    // }
    if (hasBannedDomain) {
      console.warn(`Banned domain found in contract for token ${targetToken}`);
    }
  }
}

module.exports = {
  sendTelegramMessageForPair,
}