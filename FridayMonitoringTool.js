const express = require("express");
const app = express();
const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
require("dotenv").config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true });

//store verified users
let verifiedChatIds = [];

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Handle the /start command
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
      verifiedChatIds.push(chatId); // Add to verifiedChatIds array
    } else {
      bot.sendMessage(
        chatId,
        "Access denied. Please provide the correct password."
      );
    }
  }
});

// This handles the updates from mongodb
db.once("open", function () {
  console.log("Connected to database!");

  const collection = db.collection("queries");

  const changeStream = collection.watch();

  changeStream.on("change", async (change) => {
    if (change.operationType === "insert") {
      const { userId, question, answer } = change.fullDocument;

      let ryanTest = "86028224";
      let ryanLive = "85788878"; //Ryan's testing id

      if (userId !== ryanLive && userId != ryanTest && verifiedChatId) {
        const message = `New question added:\n\nQuestion: ${question}\nAnswer: ${answer}`;
        bot.sendMessage(verifiedChatId, message);
      }
    }
  });
});

const commands = [
  { command: "/troubleshoot", description: "Guide to troubleshoot issues" },
  { command: "/reportbug", description: "Report Bugs" },
];

if (verifiedChatIds.includes(chatId)) {
  bot.setMyCommands(commands);
}

// Provides a guide to troubleshoot errors
bot.onText(/\/troubleshoot/, async (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, "What kind of problem are you facing?", {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Bot is not answering", callback_data: "no_answer" },
          { text: "Issue with respond.io", callback_data: "respond_io" },
        ],
      ],
    },
  });
});

bot.on("callback_query", async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;

  if (callbackQuery.data === "no_answer") {
    bot.sendMessage(chatId, "Please tag @weihern for assistance.");
  } else if (callbackQuery.data === "respond_io") {
    bot.sendMessage(
      chatId,
      "Please go to https://app.respond.io/space/122282/workflows/builder/1683131397851603 using our FRIDAY google account and turn the workflow off as a precaution."
    );
  }
});

// Function to report bugs
bot.onText(/\/reportbug/, (msg) => {
  const chatId = msg.chat.id;

  if (verifiedChatIds.includes(chatId)) {
    bot.sendMessage(
      chatId,
      "Issue faced:\n" +
        "Suspected platform failure: Respond.io OR OpenAI OR Heroku\n" +
        "Severity level:\n" +
        "\n" +
        "Copy this message!"
    );
  } else {
    bot.sendMessage(
      chatId,
      "Access denied. Please provide the correct password with /start command."
    );
  }
});

bot.onText(
  /^Issue faced:(.*)\nSuspected platform failure:(.*)\nSeverity level:(.*)/i,
  (msg, match) => {
    // const chatId = msg.chat.id;
    const issueFaced = match[1].trim();
    const platformFailure = match[2].trim();
    const severityLevel = match[3].trim();

    const bugReport = `New bug reported:\n\nIssue faced: ${issueFaced}\nSuspected platform failure: ${platformFailure}\nSeverity level: ${severityLevel}`;

    // Send the bug report to all verified users (who are connected)
    for (const userChatId of verifiedChatIds) {
      console.log(userChatId + " Hello");
      bot.sendMessage(userChatId, bugReport);
    }
  }
);

// Listen to the correct port specified by Heroku
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
