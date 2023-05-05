const express = require("express");
const app = express();
const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
require("dotenv").config();
const axios = require("axios");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

mongoose.connect(
  process.env.MONGODB_URL,
  { useNewUrlParser: true },
  () => trackMessages() //this is how we can track all incoming messages
);

//store verified users
let verifiedChatIds = new Set();

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Handle the /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const chatType = msg.chat.type;

  if (chatType === "channel") {
    // Check if user provided the correct password
    if (msg.text.split(" ")[1] === process.env.FRIDAYMONITORINGTOOL) {
      // bot.sendMessage(chatId, "Welcome! You have access to the bot.");
      verifiedChatIds.add(`@${msg.chat.username}`);
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
      verifiedChatIds.add(chatId); // Add to verifiedChatIds array

      const commands = [
        {
          command: "/troubleshoot",
          description: "Guide to troubleshoot issues",
        },
        { command: "/reportbug", description: "Report Bugs" },
        { command: "/newfeature", description: "Push a new feature!" },
        {
          command: "/checkserver",
          description: "Use this to check if OpenAI is online",
        },
        {
          command: "/getPassword",
          description: "Check our FRIDAY passwords",
        },
      ];

      if (chatType === "private") {
        // Check if the chat type is private
        const keyboard = {
          keyboard: commands.map((command) => [{ text: command.command }]),
          resize_keyboard: true,
          one_time_keyboard: true,
        };

        bot.sendMessage(chatId, "Available commands:", {
          reply_markup: keyboard,
        });
      }
    } else {
      bot.sendMessage(
        chatId,
        "Access denied. Please provide the correct password."
      );
    }
  }
});

// Provides a guide to troubleshoot errors
bot.onText(/\/troubleshoot/, async (msg) => {
  const chatId = msg.chat.id;

  if (verifiedChatIds.has(chatId)) {
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
  } else {
    bot.sendMessage(
      chatId,
      "Access denied. Please provide the correct password with /start command."
    );
  }
});

bot.on("callback_query", async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;

  if (callbackQuery.data === "no_answer") {
    bot.sendMessage(chatId, "Please tag @weihern for assistance.");
  } else if (callbackQuery.data === "respond_io") {
    bot.sendMessage(
      chatId,
      "Please go to https://app.respond.io/space/122282/workflows/builder/1683131397851603 using our FRIDAY Google account and turn the workflow off as a precaution."
    );
  } else if (callbackQuery.data === "new_feature") {
    // Send message with buttons to select the platform
    bot.sendMessage(chatId, "Which platform did you build the feature on?", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Respond.io", callback_data: "platform_respond_io" },
            {
              text: "Backend Server",
              callback_data: "platform_backend_server",
            },
            { text: "FRIDAY AI", callback_data: "platform_friday_ai" },
          ],
        ],
      },
    });
  } else if (
    callbackQuery.data === "platform_respond_io" ||
    callbackQuery.data === "platform_backend_server" ||
    callbackQuery.data === "platform_friday_ai"
  ) {
    const platform = callbackQuery.data.split("_")[1];

    // Send message to input feature details
    bot.sendMessage(chatId, `What is the feature you built on ${platform}?`);

    // Set listener to handle feature details
    bot.once("message", (msg) => {
      const featureDetails = msg.text;

      // Send message to input short description of feature
      bot.sendMessage(
        chatId,
        "Please provide a short description of the feature you built."
      );

      // Set listener to handle short description of feature
      bot.once("message", (msg) => {
        const featureDescription = msg.text;

        // Send message to all verified users with the feature details
        for (const userChatId of verifiedChatIds) {
          bot.sendMessage(
            userChatId,
            `New feature added!\n\nPlatform: ${platform}\nFeature: ${featureDetails}\nDescription: ${featureDescription}`
          );
        }

        // Send confirmation message to user
        bot.sendMessage(chatId, "Feature added successfully!");
      });
    });
  } else if (
    callbackQuery.data === "heroku_password" ||
    callbackQuery.data === "huggingface_password" ||
    callbackQuery.data === "gmail/mongodb_password"
  ) {
    let password;
    switch (callbackQuery.data) {
      case "heroku_password":
        password = process.env.HEROKU_PASSWORD;
        break;
      case "huggingface_password":
        password = process.env.HUGGINGFACE_PASSWORD;
        break;
      case "gmail/mongodb_password":
        password = process.env.GMAIL_PASSWORD;
        break;
    }
    bot
      .sendMessage(chatId, `Password: ${password}`, {
        reply_to_message_id: callbackQuery.message.message_id,
        reply_markup: { remove_keyboard: true },
      })
      .then((msg) => {
        setTimeout(() => bot.deleteMessage(msg.chat.id, msg.message_id), 10000); // Delete message after 10 seconds
      });
  }
});

//Function to get our passwords
bot.onText(/\/getPassword/, (msg) => {
  const chatId = msg.chat.id;

  if (verifiedChatIds.has(chatId)) {
    // Send message with buttons to select the platform
    bot.sendMessage(chatId, "Select a website to get the password from:", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Heroku", callback_data: "heroku_password" },
            { text: "Hugging Face", callback_data: "huggingface_password" },
          ],
          [{ text: "Gmail/MongoDB", callback_data: "gmail/mongodb_password" }],
        ],
      },
    });
  } else {
    bot.sendMessage(
      chatId,
      "Access denied. Please provide the correct password with /start command."
    );
  }
});

//checking OpenAI (FAST API) server to see if it is working
bot.onText(/\/checkserver/, async (msg) => {
  const chatId = msg.chat.id;

  if (verifiedChatIds.has(chatId)) {
    try {
      const response = await axios.get("http://54.238.198.35/");
      if (response.data.Test === "Hello World") {
        bot.sendMessage(chatId, "Server is running!");
      } else {
        bot.sendMessage(chatId, "Server is not responding properly.");
      }
    } catch (error) {
      bot.sendMessage(chatId, "Server is not responding.");
    }
  } else {
    bot.sendMessage(
      chatId,
      "Access denied. Please provide the correct password with /start command."
    );
  }
});

// Function to report bugs
bot.onText(/\/reportbug/, (msg) => {
  const chatId = msg.chat.id;

  if (verifiedChatIds.has(chatId)) {
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
  /^Issue faced:([\s\S]*?)\n+(?:Suspected|Platform) failure:([\s\S]*?)\n+Severity level:([\s\S]*?)$/i,
  (msg, match) => {
    const issueFaced = match[1].trim();
    const platformFailure = match[2].trim();
    const severityLevel = match[3].trim();

    const bugReport = `New bug reported:\n\nIssue faced: ${issueFaced}\nSuspected platform failure: ${platformFailure}\nSeverity level: ${severityLevel}`;

    for (const userChatId of verifiedChatIds) {
      bot.sendMessage(userChatId, bugReport).catch((err) => {
        console.error(`Error sending message to user ${userChatId}: ${err}`);
      });
    }
  }
);

//test
bot.onText(/\/newfeature/, (msg) => {
  const chatId = msg.chat.id;

  if (verifiedChatIds.has(chatId)) {
    // Send message with buttons to select the platform
    bot.sendMessage(chatId, "Which platform did you build the feature on?", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Respond.io", callback_data: "platform_respond_io" }, // Update callback_data
            {
              text: "Backend Server",
              callback_data: "platform_backend_server",
            }, // Update callback_data
            { text: "FRIDAY AI", callback_data: "platform_friday_ai" }, // Update callback_data
          ],
        ],
      },
    });
  }
});

//track mongodb changes
async function trackMessages() {
  const collection = db.collection("queries");
  const changeStream = collection.watch();

  changeStream.on("change", (next) => {
    // Perform actions when a new object is inserted into the collection
    console.log("New object inserted:", next.fullDocument);

    const question = next.fullDocument.question;
    const answer = next.fullDocument.answer;

    // Notify all verified users of the new object
    for (const userChatId of verifiedChatIds) {
      bot.sendMessage(
        userChatId,
        `New question added:\n\nQuestion: ${question}\nAnswer: ${answer}`
      );
    }
  });

  //query mongo for question and answer
  app.post("/question", async (req, res) => {
    const question = req.body.question;
    if (!question) {
      return res.status(400).json({ error: "Missing 'q' parameter" });
    }

    try {
      const result = await findQuestion(question);
      if (result) {
        res.send({ answer: result });
      } else {
        res.status(404).json({ error: "Question not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  //Then, create a function to find a question in the database:

  async function findQuestion(question) {
    const collection = db.collection("queries");
    console.log(question + " This is the question");
    const result = await collection.findOne({ question: question });
    console.log(result + " This is the result");
    return result;
  }
}

// Listen to the correct port specified by Heroku
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
