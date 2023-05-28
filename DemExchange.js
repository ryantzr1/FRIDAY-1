const express = require("express");
const app = express();
const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
require("dotenv").config();
const axios = require("axios");

// const bot = new TelegramBot(process.env.CARBON_TEST_TOKEN, { polling: true });

//TRENGO SHIT
const TRENGO_URL =
  "https://web.trengo.eu/telegram/hook/3AEKr0cYhZdm7R7DM2U7wPBJFaM2ZwEa4JXb9j4KZQ9mtLbzyPNSfeuBmq39E83QbLWIHgtcO9SPiX3gZkl3dskWB0gOlx240WAknQq2OMOqr3vhCHpJy01XIOB4r/1276928";

const TRENGO_SEND_MSG_URL =
  "https://api.v7.botpenguin.com/telegram-automation/messages/v2/send-message";
const BOT_ID = "647386515148d5acaaad0b68";
const SUBSCRIBER_ID = "6473869d5148d5acaaad0b7a";
//Trengo^^

const bot = new TelegramBot(process.env.CARBON_TEST_TOKEN);
bot.setWebHook("https://3ec9-54-199-193-55.jp.ngrok.io/bot");

const port = process.env.PORT || 8443;

app.use(express.json());

app.post("/bot", async (req, res) => {
  bot.processUpdate(req.body);

  // Forward the update to the Trengo server
  try {
    await axios.post(TRENGO_URL, req.body);
  } catch (error) {
    console.error("Error forwarding update to Trengo:", error);
  }
  // Send th  e HTTP 200 status code to indicate a successful HTTP request
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

  // bot.sendMessage(chatId, response.trim() + "\n");

  //use Trengo to send the message LOL
  try {
    const messageData = {
      _bot: BOT_ID,
      text: response.trim() + "\n",
      _subscriber: SUBSCRIBER_ID,
      type: "text",
    };
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNDlkZGVhZDczYTU1N2FjYmJlMDVkYTM5N2RiODQyNjljMTY5MmUyZGUyNGFkYmU4OGRhZmJhNWIyMmVjNTk1NjI0ZDUxN2QwNzRiNTEyNjAiLCJpYXQiOjE2ODUxMjM4OTguNTQxMjU3LCJuYmYiOjE2ODUxMjM4OTguNTQxMjYsImV4cCI6MTcxNjc0NjI5OC41MzAyODMsInN1YiI6IjY5NTIxNyIsInNjb3BlcyI6W119.IUY2gaTGF7qs3r1f9v58rxc6iy6FU5ZIBZ3uwHrvBIsPMd_054EfNgrGfFg1WPU0sadEbqTl1e081IQ2VneHNA`,
    };
    await axios.post(TRENGO_SEND_MSG_URL, messageData, { headers });
  } catch (error) {
    console.error("Error sending message to Trengo:", error.response || error);
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
