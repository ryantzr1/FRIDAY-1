const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
require("dotenv").config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

const {
  registerHandlers,
  onStart,
  onTroubleshoot,
  onCallbackQuery,
  onGetPassword,
  onCheckServer,
  onReportBug,
  onNewFeature,
} = require("./commands");

// Register bot commands
registerHandlers(bot);

module.exports = bot;
