const mongoose = require("mongoose");
require("dotenv").config();
const { verifiedChatIds } = require("./bot");

mongoose.connect(
  process.env.MONGODB_URL,
  { useNewUrlParser: true },
  () => trackMessages() //this is how we can track all incoming messages
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

async function trackMessages() {
  const collection = db.collection("queries");
  const changeStream = collection.watch();

  changeStream.on("change", (next) => {
    // Perform actions when a new object is inserted into the collection
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
}

module.exports = db;
