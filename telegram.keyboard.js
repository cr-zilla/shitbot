const config = require("./config.js")
const { bot } = require('./config-telegram.bot.js');
const { addReminder, getRemindTime } = require('./telegram.reminders.js');

function buildInlineKeyboard(pair) {

  const inlineKeyboard = [];

  const oneMinButton = {
    text: "Remind in 1m",
    callback_data: JSON.stringify({
      t: "remind",
      tm: "1m",
      tr: pair.token0.symbol,
    }),
  };

  const oneDayButton = {
    text: "Remind in 1d",
    callback_data: JSON.stringify({
      t: "remind",
      tm: "1d",
      tr: pair.token0.symbol,
    }),
  };

  const oneHourButton = {
    text: "Remind me in 1hr",
    callback_data: JSON.stringify({
      t: "remind",
      tm: "1h",
      tr: pair.token0.symbol,
    }),
  };

  const contractLinkButton = {
    text: "🤝 Contract",
    url: `https://etherscan.io/address/${pair.token0.id}/#code`,
  };

  const holdersLinkButton = {
    text: "👥 Holders",
    url: `https://etherscan.io/token/${pair.token0.id}#balances`,
  };

  const dexscreenerLinkButton = {
    text: `📊 Dexscreener for ${pair.token0.symbol}-${pair.token1.symbol}`,
    url: `https://dexscreener.com/ethereum/${pair.id}`,
  };

  const gopluslabsLinkButton = {
    text: "🕵️ GoPlus analysis",
    url: `https://api.gopluslabs.io/api/v1/token_security/1?contract_addresses=${pair.token0.id}`,
  };

  const moonarchButton = {
    text: "🕵️ Moonarch analysis",
    url: `https://eth.moonarch.app/token/${pair.token0.id}`
  };

  const contractTweetSearch = {
    text: `🐦 $${pair.token0.symbol} tweets`,
    url: `https://twitter.com/search?q=%24${pair.token0.symbol}&src=typed_query`,
  };

  const cashtagTweetSearch = {
    text: "🐦 Contract tweets",
    url: `https://twitter.com/search?q=%24${pair.token0.id}&src=typed_query`,
  };

  // Each array within the array becomes a row of buttons...
  inlineKeyboard.push(
    [dexscreenerLinkButton],
    [contractLinkButton, holdersLinkButton],
    [gopluslabsLinkButton, moonarchButton],
    [cashtagTweetSearch, contractTweetSearch],
    [oneMinButton, oneHourButton, oneDayButton],
  );

  return inlineKeyboard;
}

// Add the event listener for 'callback_query'
bot.on('callback_query', async (callbackQuery) => {
  const callbackData = JSON.parse(callbackQuery.data);

  if (callbackData.t === 'remind') {
    const originalMessage = callbackQuery.message;
    const chatId = originalMessage.chat.id;
    const chatIdForUrl = (originalMessage.chat.id).toString().slice(4);
    const messageId = originalMessage.message_id;
    const messageTopic = originalMessage.message_thread_id;
    const pairId = originalMessage.text.match(/Pair ID: ([\w-]+)/)[1];
    // const targetTickerMatch = originalMessage.text.match(/^💩(\$?\w+)-/);
    const targetTicker = callbackData.tr;
    const requestingUser = callbackQuery.from.username;
    var formattedRemindTime = null;

    if (callbackData.tm) {
      const reminderSummaryLog = `${requestingUser} set a ${callbackData.tm} reminder for ${targetTicker} https://t.me/c/${chatIdForUrl}/${messageTopic}/${messageId}`;
      console.log(reminderSummaryLog);
      // Send summary of reminder action to public log
      const options = { message_thread_id: config.TELEGRAM_ACTIVITY_TOPIC }
      bot.sendMessage(chatId, reminderSummaryLog, options);
      // Set up and schedule the appropriately delayed message 
      const remindTime = getRemindTime(callbackData.tm);
      const remindTimeDate = new Date(remindTime * 1000);
      formattedRemindTime = remindTimeDate.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
      // Add the reminder to the JSON file
      addReminder(chatId, remindTime, requestingUser, originalMessage.message_id, targetTicker, pairId);
    }

    // Send an answer to the callback query
    bot.answerCallbackQuery(callbackQuery.id, { text: `✅ Reminder set for ${formattedRemindTime}` }).catch((error) => {
      console.warn('Error handling TG callback:', error.message);
    });

  }
});

module.exports = { buildInlineKeyboard };