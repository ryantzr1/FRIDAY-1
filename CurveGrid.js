const express = require("express");
const app = express();
const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
require("dotenv").config();
const axios = require("axios");

const bot = new TelegramBot(process.env.CURVEGRID_TEST_TOKEN, {
  polling: true,
});

const port = process.env.PORT || 8443;

app.use(express.json());

// Define the MongoDB schema for storing items from CurveGrid
const CurveGridSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  success: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now },
  history: { type: Array, required: true },
  company: { type: String, required: true },
  username: { type: String, required: true },
});

const CurveGrid = mongoose.model("CurveGrid", CurveGridSchema);

mongoose.connect(
  process.env.MONGODB_URL,
  { useNewUrlParser: true },
  () =>
    bot.on("message", async (msg) => {
      try {
        await onMessage(msg);
      } catch (err) {
        console.error("Error processing message:", err);
      }
    }) // This is how we can track all incoming messages
);

// Handle the /start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Hi! How may I assist you?");
});

async function onMessage(msg) {
  if (msg.text.startsWith("/")) return; // Ignore commands

  const chatId = msg.chat.id;
  const apiEndpoint = "http://43.206.109.246/predict";
  const userId = chatId;

  let question = msg.text;

  console.log(question);

  const encodedQuestion = encodeURIComponent(question);
  const url = `${apiEndpoint}?question=${encodedQuestion}`;

  let requestBody = {
    chat_history: [],
    company_info: {
      company_desc: "CurveGrid is a blockchain tooling startup.",
      company_name: "CurveGrid",
      product_list: [""],
      tools: ["VectorDatabase"],
      usable_tools: ["VectorDatabase"],
    },
  };

  const prevConvoArr = await CurveGrid.find({ userId: userId });

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

  if (success) {
    bot.sendMessage(chatId, response.trim() + "\n");
  }

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

  const query = new CurveGrid({
    question: question,
    answer: answer,
    userId: userId,
    success: success,
    history: currentHistory,
    company: "CurveGrid",
    username: msg.from.username || null, //Telegram Username
  });

  await query.save();

  if (prevConvoArr.length > 0) {
    const lastQuery = prevConvoArr[prevConvoArr.length - 1];
  }

  if (!success) {
    bot.sendMessage(
      chatId,
      "Sorry, I didn't understand your question. Our team will be with you shortly."
    );
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
