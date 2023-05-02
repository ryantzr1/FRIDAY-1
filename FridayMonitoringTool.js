const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
require("dotenv").config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true });

const specificUserId = "1"; //86028224

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  // Check if user provided the correct password
  if (msg.text.split(" ")[1] === process.env.FRIDAYMONITORINGTOOL) {
    bot.sendMessage(chatId, "Welcome! You have access to the bot.");
  } else {
    bot.sendMessage(
      chatId,
      "Access denied. Please provide the correct password."
    );
  }
});

db.once("open", function () {
  console.log("Connected to database!");

  const collection = db.collection("queries");

  const changeStream = collection.watch();

  changeStream.on("change", async (change) => {
    if (change.operationType === "insert") {
      const { userId, question, answer } = change.fullDocument;

      if (userId !== specificUserId) {
        const message = `New question added:\n\nQuestion: ${question}\nAnswer: ${answer}`;
        bot.sendMessage(process.env.TELEGRAM_USER_ID, message);
      }
    }
  });
});
