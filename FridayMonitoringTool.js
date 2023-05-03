const express = require("express");
const app = express();
const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
require("dotenv").config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true });

let verifiedChatId = null;

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const chatType = msg.chat.type;

  if (chatType === "channel") {
    // Check if user provided the correct password
    if (msg.text.split(" ")[1] === process.env.FRIDAYMONITORINGTOOL) {
      bot.sendMessage(chatId, "Welcome! You have access to the bot.");
      verifiedChatId = `@${msg.chat.username}`;
    } else {
      bot.sendMessage(
        chatId,
        "Access denied. Please provide the correct password."
      );
    }
  } else {
    // Private chat handling remains the same
    if (msg.text.split(" ")[1] === process.env.FRIDAYMONITORINGTOOL) {
      bot.sendMessage(chatId, "Welcome! You have access to the bot.");
      verifiedChatId = chatId;
    } else {
      bot.sendMessage(
        chatId,
        "Access denied. Please provide the correct password."
      );
    }
  }
});

db.once("open", function () {
  console.log("Connected to database!");

  const collection = db.collection("queries");

  const changeStream = collection.watch();

  changeStream.on("change", async (change) => {
    if (change.operationType === "insert") {
      const { userId, question, answer } = change.fullDocument;

      let specificUserId = "86028224"; //Ryan's testing id

      if (userId !== specificUserId && verifiedChatId) {
        const message = `New question added:\n\nQuestion: ${question}\nAnswer: ${answer}`;
        bot.sendMessage(verifiedChatId, message);
      }
    }
  });
});

// Listen to the correct port specified by Heroku
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
