const config = require ("./config.js")
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, { polling: Boolean(config.TELEGRAM_POLLING_ON ?? false) });
module.exports = { bot };
