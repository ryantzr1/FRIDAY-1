const mongoose = require("mongoose");
require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { bot, verifiedChatIds } = require("./bot");

mongoose.connect(
  process.env.MONGODB_URL,
  { useNewUrlParser: true },
  () => trackMessages() //this is how we can track all incoming messages
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

async function trackMessages() {
  try {
    collections = await db.listCollections().toArray();
  } catch (err) {
    console.error(err);
    return;
  }
  const changeStreams = [];
  // const collection = db.collection("queries");
  // const changeStream = collection.watch();
  collections.forEach((collection) => {
    const changeStream = collection.watch();
    changeStreams.push(changeStream);

    changeStream.on("change", (next) => {
      // Perform actions when a new object is inserted into the collection
      const collectionName = collection.name;
      const question = next.fullDocument.question;
      const answer = next.fullDocument.answer;

      // Notify all verified users of the new object
      for (const userChatId of verifiedChatIds) {
        bot.sendMessage(
          userChatId,
          `New question added:\n\nCollection: ${collectionName}\nQuestion: ${question}\nAnswer: ${answer}`
        );
      }
    });
  });
}

module.exports = { db, bot };
