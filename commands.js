const db = require("./databaseHandle");
const bot = require("./bot");
const axios = require("axios");

// Store verified users
let verifiedChatIds = new Set();
verifiedChatIds.add(-842373692); //grp chat
verifiedChatIds.add(293830606); //ryan

function registerHandlers(bot) {
  bot.onText(/\/start/, onStart);
  bot.onText(/\/troubleshoot/, onTroubleshoot);
  bot.onText(/\/getpassword/, onGetPassword);
  bot.onText(/\/checkserver/, onCheckServer);
  bot.onText(/\/reportbug/, onReportBug);
  bot.onText(/\/newfeature/, onNewFeature);
  bot.on("callback_query", onCallbackQuery);
  bot.onText(
    /^Issue faced:([\s\S]*?)\n+(?:Suspected|Platform) failure:([\s\S]*?)\n+Severity level:([\s\S]*?)$/i,
    onBugReportMessage
  );
}

function onStart(msg) {
  const chatId = msg.chat.id;
  const chatType = msg.chat.type;

  if (chatType === "channel") {
    if (msg.text.split(" ")[1] === process.env.FRIDAYMONITORINGTOOL) {
      verifiedChatIds.add(`@${msg.chat.username}`);
    } else {
      bot.sendMessage(
        chatId,
        "Access denied. Please provide the correct password."
      );
    }
  } else {
    if (msg.text.split(" ")[1] === process.env.FRIDAYMONITORINGTOOL) {
      bot.sendMessage(chatId, "Welcome! You have access to the bot.");
      verifiedChatIds.add(chatId);

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
          command: "/getpassword",
          description: "Check our FRIDAY passwords",
        },
      ];

      if (chatType === "private") {
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
}

function onTroubleshoot(msg) {
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
}

function onCallbackQuery(callbackQuery) {
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
}

function onGetPassword(msg) {
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
}

async function onCheckServer(msg) {
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
}

function onReportBug(msg) {
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
}

//handle new bug report message
function onBugReportMessage(msg) {
  const bugReportRegex =
    /^Issue faced:([\s\S]*?)\n+(?:Suspected|Platform) failure:([\s\S]*?)\n+Severity level:([\s\S]*?)$/i;
  const match = bugReportRegex.exec(msg.text);

  if (match) {
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
}

function onNewFeature(msg) {
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
}

module.exports = {
  registerHandlers,
  onStart,
  onTroubleshoot,
  onCallbackQuery,
  onGetPassword,
  onCheckServer,
  onReportBug,
  onNewFeature,
};
