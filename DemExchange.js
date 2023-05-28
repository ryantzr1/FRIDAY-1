const express = require("express");
const app = express();
const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
require("dotenv").config();
const axios = require("axios");

// const bot = new TelegramBot(process.env.CARBON_TEST_TOKEN, { polling: true });

const bot = new TelegramBot(process.env.CARBON_TEST_TOKEN);
bot.setWebHook("https://20a8-54-199-193-55.jp.ngrok.io/bot");

const port = process.env.PORT || 8443;

app.use(express.json());

app.post("/bot", (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

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

mongoose.connect(
  process.env.MONGODB_URL,
  { useNewUrlParser: true },
  () => bot.on("message", onMessage) // This is how we can track all incoming messages
);

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
  console.log(question);

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
  console.log(answer);
  const agent = responseAI.data.agent;

  const success = !answer.includes("[NO ANSWER]");

  // Split the answer into paragraphs while preserving sentence boundaries
  let paragraphs = [];
  let currentParagraph = "";
  const sentences = answer.split(". ");
  for (const sentence of sentences) {
    if (currentParagraph.length + sentence.length <= 40) {
      currentParagraph += sentence + ". ";
    } else {
      paragraphs.push(currentParagraph.trim());
      currentParagraph = sentence + ". ";
    }
  }
  paragraphs.push(currentParagraph.trim());

  // Construct the response with paragraphs
  let response = paragraphs.join("\n\n");

  // Remove the last period if present
  response = response.replace(/\.$/, "");

  bot.sendMessage(chatId, response.trim() + "\n");

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
    company: "Demex",
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
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
