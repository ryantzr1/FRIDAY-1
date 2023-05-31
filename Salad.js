const { Client, GatewayIntentBits } = require("discord.js");
const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config();
const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
// Define the MongoDB schema for storing items from SaladVenture
const SaladVentureSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  success: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now },
  history: { type: Array, required: true },
  company: { type: String, required: true },
});

const SaladVenture = mongoose.model("SaladVenture", SaladVentureSchema);

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true });

bot.on("ready", () => {
  console.log(`Bot is running`);
});

bot.on("messageCreate", async (msg) => {
  if (!msg.content.contains("<@1113322148535226448>") || msg.author.bot)
    //only reply to message that tag the bot
    return;

  try {
    await onMessage(msg);
  } catch (err) {
    console.error("Error processing message:", err);
  }
});

async function onMessage(msg) {
  if (msg.content.startsWith("/")) return; // Ignore commands

  const userId = msg.author.id;
  const apiEndpoint = "http://43.207.93.240/test"; // Your API endpoint here
  let question = msg.content;
  console.log(question);

  const encodedQuestion = encodeURIComponent(question);
  const url = `${apiEndpoint}?question=${encodedQuestion}`;

  let requestBody = {
    chat_history: [],
    company_info: {
      company_desc:
        "SaladVenture is a blockchain thinktank that develops and backs innovations in the growing gamefi space.",
      company_name: "SaladVentures",
      product_list: [""],
      tools: ["VectorDatabase"],
      usable_tools: ["VectorDatabase"],
    },
  };

  const prevConvoArr = await SaladVenture.find({ userId: userId });

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
    msg.reply(chatId, response.trim() + "\n");
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

  const query = new SaladVenture({
    question: question,
    answer: answer,
    userId: userId,
    success: success,
    history: currentHistory,
    company: "SaladVentures",
  });

  await query.save();

  if (prevConvoArr.length > 0) {
    const lastQuery = prevConvoArr[prevConvoArr.length - 1];
  }

  if (!success) {
    msg.reply(
      "Sorry, I didn't understand your question. Our team will be with you shortly."
    );
  }
}

bot.login(process.env.DISCORD_BOT_TOKEN);
