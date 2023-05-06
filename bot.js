const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
require("dotenv").config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

const {
  onStart,
  onTroubleshoot,
  onCallbackQuery,
  onGetPassword,
  onCheckServer,
  onReportBug,
  onNewFeature,
  onBugReportMessage,
} = require("./commands");

// Register bot commands
bot.onText(/\/start/, onStart);
bot.onText(/\/troubleshoot/, onTroubleshoot);
bot.onText(/\/getpassword/, onGetPassword);
bot.onText(/\/checkserver/, onCheckServer);
bot.onText(/\/reportbug/, onReportBug);
bot.onText(/\/newfeature/, onNewFeature);
bot.on("callback_query", onCallbackQuery);
bot.onText(
  /^Issue faced:([\s\S]*?)\n+(?:Suspected|Platform) failure:([\s\S]*?)\n+Severity level:([\s\S]*?)$/i,
  onBugReportMessage
);

module.exports = bot;
