const express = require("express");
const app = express();
const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
require("dotenv").config();
const axios = require("axios");

const bot = new TelegramBot(process.env.CARBON_TEST_TOKEN);
const port = process.env.PORT || 8443;

app.use(express.json());

// Define the MongoDB schema for storing items from LayerZero
const CarbonSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  success: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now },
  history: { type: Array, required: true },
  company: { type: String, required: true },
});

const Carbon = mongoose.model("Carbon", CarbonSchema);

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true }, () => {
  console.log("Connected to MongoDB");
});

// Set up webhook for receiving updates from Telegram
// bot.setWebHook(
//   `https://ec2-54-199-193-55.ap-northeast-1.compute.amazonaws.com/webhook`
// );

// // Handle incoming messages
// app.post(`/webhook`, (req, res) => {
//   const message = req.body.message;
//   console.log(message);
//   if (message) {
//     onMessage(message);
//   }
//   res.sendStatus(200);
// });

// Handle the /start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Hi! How may I assist you?");
});

async function onMessage(msg) {
  if (msg.text.startsWith("/")) return; // Ignore commands

  const chatId = msg.chat.id;
  const apiEndpoint = "http://52.194.232.215/test";
  const userId = chatId;

  const question = msg.text;

  const encodedQuestion = encodeURIComponent(question);
  const url = `${apiEndpoint}?question=${encodedQuestion}`;

  let requestBody = {
    chat_history: [],
    company_info: {
      company_desc: "DemExchange is a crypto DeFi platform.",
      company_name: "Demex",
      product_list: [""],
      tools: ["VectorDatabase"],
      usable_tools: ["VectorDatabase"],
    },
  };

  const prevConvoArr = await Carbon.find({ userId: userId });

  if (prevConvoArr.length !== 0) {
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

  if (prevConvoArr.length !== 0) {
    previousHistory = prevConvoArr[prevConvoArr.length - 1].history;
    currentHistory = previousHistory.concat(currentHistory);
  }

  const query = new Carbon({
    question: question,
    answer: answer,
    userId: userId,
    success: success,
    history: currentHistory,
    company: "Carbon",
  });

  await query.save();

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

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
