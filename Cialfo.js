const express = require("express");
const app = express();
const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
require("dotenv").config();
const axios = require("axios");

const bot = new TelegramBot(process.env.CIALFO_BOT_TOKEN, { polling: true });

// Define the MongoDB schema for storing items from LayerZero
const CialfoSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  success: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now },
  history: { type: Array, required: true },
  company: { type: String, required: true },
});

const Cialfo = mongoose.model("Cialfo", CialfoSchema);

mongoose.connect(
  process.env.MONGODB_URL,
  { useNewUrlParser: true },
  () => bot.on("message", onMessage) //this is how we can track all incoming messages
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Handle the /start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Hi! How may I assist you?");
});

async function onMessage(msg) {
  if (msg.text.startsWith("/")) return; // Ignore commands

  const chatId = msg.chat.id;
  const apiEndpoint = "http://18.183.218.48/test";
  const userId = chatId;

  const question = msg.text;

  const encodedQuestion = encodeURIComponent(question);
  const url = `${apiEndpoint}?question=${encodedQuestion}`;

  let requestBody = {
    chat_history: [],
    company_info: {
      company_desc: "Cialfo is a college applications platform.",
      company_name: "Cialfo",
      product_list: [""],
      tools: ["VectorDatabase"],
      usable_tools: ["VectorDatabase"],
    },
  };

  const prevConvoArr = await Cialfo.find({ userId: userId });

  if (prevConvoArr.length != 0) {
    const previousHistory = prevConvoArr[prevConvoArr.length - 1].history;
    requestBody = {
      chat_history: [],
      company_info: requestBody.company_info,
    };
  }

  const responseAI = await axios.post(url, requestBody);
  const answer = responseAI.data.answer;
  const agent = responseAI.data.agent;

  const success = !answer.includes("[NO ANSWER]");

  let currentHistory = [
    {
      role: "user",
      content: question,
    },
    {
      role: "assistant",
      content: answer,
    },
  ];

  if (prevConvoArr.length != 0) {
    previousHistory = prevConvoArr[prevConvoArr.length - 1].history;
    currentHistory = previousHistory.concat(currentHistory);
  }

  const query = new Cialfo({
    question: question,
    answer: answer,
    userId: userId,
    success: success,
    history: currentHistory,
    company: "Cialfo",
  });

  await query
    .save()
    .then()
    .catch((e) => console.log(e));

  let consecutiveFails = 0;
  if (prevConvoArr.length > 0) {
    const lastQuery = prevConvoArr[prevConvoArr.length - 1];
    if (!lastQuery.success) {
      consecutiveFails++;
    }
  }

  if (!success) {
    consecutiveFails++;
  }

  if (!success && consecutiveFails < 2) {
    bot.sendMessage(
      chatId,
      "Sorry, we didn't understand your question, please try again."
    );
  } else if (!success && consecutiveFails >= 2) {
    bot.sendMessage(
      chatId,
      "We did not get your question, please hold as our team will be with you shortly."
    );
  } else {
    bot.sendMessage(chatId, answer);
  }
}

// Listen to the correct port specified by Heroku
const PORT = process.env.PORT || 1111;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
