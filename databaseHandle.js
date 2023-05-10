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
  // Get the names of all collections in the database
  const collectionNames = await db.listCollections().toArray();

  // Watch each collection and handle changes
  for (const collectionInfo of collectionNames) {
    const collection = db.collection(collectionInfo.name);
    const changeStream = collection.watch();

    changeStream.on("change", (next) => {
      // Perform actions when a new object is inserted into the collection
      if (next.operationType === "insert") {
        const fullDocument = next.fullDocument;

        const question = fullDocument.question;
        const answer = fullDocument.answer;

        // Notify all verified users of the new object
        for (const userChatId of verifiedChatIds) {
          bot.sendMessage(
            userChatId,
            `New question added (${collectionInfo.name}):\n\nQuestion: ${question}\nAnswer: ${answer}`
          );
        }
      }
    });
  }
}

module.exports = { db, bot };
