const { Client, GatewayIntentBits } = require("discord.js");
const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config();
const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers, // Add this intent to listen for new members joining
  ],
});
// Define the MongoDB schema for storing items from SaladVenture
const SaladVentureSchema = new mongoose.Schema({
  username: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  success: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now },
  history: { type: Array, required: true },
  company: { type: String, required: true },
});

const SaladVenture = mongoose.model("SaladVenture", SaladVentureSchema);

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true });

// const approvedServerIDs = ["your-server-id"]; // Replace with your server ID(s)

// bot.on("guildCreate", (guild) => {
//   if (!approvedServerIDs.includes(guild.id)) {
//     console.log(
//       `I have been added to a server that is not approved: ${guild.name} (id: ${guild.id}). Leaving...`
//     );
//     guild.leave();
//   }
// });

bot.on("ready", () => {
  console.log(`Bot is running`);

  // Send a message every 10 minutes
  setInterval(() => {
    const currentHour = moment().tz("Asia/Singapore").hours();
    if (currentHour >= 0 && currentHour < 7) {
      // Check if current time is between 12am and 7am
      bot.channels.cache
        .get("1118201772524191826")
        .send(
          "Hi I am FRIDAY, your AI assistant. Tag me if you have any questions"
        );
    }
  }, 600000); //60000 milliseconds = 10 minutes
});

bot.on("messageCreate", async (msg) => {
  const currentHour = moment().tz("Asia/Singapore").hours();
  if (currentHour < 12 || currentHour >= 18) return; // Ignore messages if current time is not between 12am and 6am
  if (!msg.content.startsWith("<@1118202260732780634>") || msg.author.bot) {
    //only reply to message that tag the bot
    return;
  }

  try {
    await onMessage(msg);
  } catch (err) {
    console.error("Error processing message:", err);
  }
});

// Greet new users when they join the Discord channel
bot.on("guildMemberAdd", (member) => {
  const channel = member.guild.channels.cache.find(
    (channel) => channel.name === "general"
  ); // Send message to 'general' channel
  if (!channel) return; // If the channel was not found, do nothing
  channel.send(
    `Hi, <@${member.user.id}>, welcome to our Discord server! I'm FRIDAY, your AI assistant. Please tag me if you have any questions.`
  );
});

async function onMessage(msg) {
  if (msg.content.startsWith("/")) return; // Ignore commands

  const username = msg.author.username;
  const apiEndpoint = "http://43.207.57.87/test"; // Your API endpoint here
  let question = msg.content;
  question = question.replace(/<@.*?>/g, "").trim();
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

  const prevConvoArr = await SaladVenture.find({ username: username });

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

  const nonAnswerPhrases = ["answer", "context", "[NO ANSWER]"];

  let success = true;
  for (const phrase of nonAnswerPhrases) {
    if (answer.includes(phrase)) {
      success = false;
    }
  }

  // Split the answer into paragraphs while preserving sentence boundaries
  let paragraphs = [];
  let currentParagraph = "";
  const sentences = answer.split(". ");
  for (const sentence of sentences) {
    if (sentence.toLowerCase().includes("information")) {
      continue; // Skip the sentence if it contains the word "information"
    }

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
    msg.reply(response.trim() + "\n");
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
    username: username,
    success: success,
    history: currentHistory,
    company: "SaladVentures",
  });

  await query.save();

  if (prevConvoArr.length > 0) {
    const lastQuery = prevConvoArr[prevConvoArr.length - 1];
  }

  if (!success) {
    //916170162024108062 this is The support Ticket channel id ( we will switch)
    const supportTicketChannelId = "1113323169399451763"; // Replace with your support ticket channel ID
    msg.reply(
      `Sorry, I didn't understand your question. Please open a support ticket here <#${supportTicketChannelId}>.`
    );
  }
}

bot.login(process.env.DISCORD_BOT_TOKEN);
