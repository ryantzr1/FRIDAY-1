const token = process.env.TOKEN;

const axios = require("axios");
const e = require("express");
const Bot = require("node-telegram-bot-api");
let bot;
const Convo = require("./MongoDBModel/ConvoModel"); //importing Convos

if (process.env.NODE_ENV === "production") {
  bot = new Bot(token);
  bot.setWebHook(process.env.HEROKU_URL + bot.token);
} else {
  bot = new Bot(token, { polling: true });
}

console.log("Bot server started in the " + process.env.NODE_ENV + " mode");

bot.on("message", async (msg) => {
  console.log(msg);
  try {
    const text = msg.text;
    console.log(text);
    const res = await axios.get("http://13.115.58.243/predict", {
      params: { question: text },
    });
    console.log(res.data);
    const answer = res.data.answer;

    //a convo instance
    const convo = new Convo({ question: text, answer: answer });
    console.log(convo);
    convo.save(function (err, convo) {
      if (err) {
        return console.log(err);
      } else {
        console.log(convo.name + "saved to Convos collection");
      }
    });
    bot.sendMessage(msg.chat.id, answer).then(() => {});
  } catch (e) {
    console.log(e.message);
    bot
      .sendMessage(msg.chat.id, "Sorry. We are unable to process your query.")
      .then(() => {});
  }
});

module.exports = bot;
