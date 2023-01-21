const token = process.env.TOKEN;

const axios = require('axios');
const Bot = require('node-telegram-bot-api');
let bot;

if(process.env.NODE_ENV === 'production') {
  bot = new Bot(token);
  bot.setWebHook(process.env.HEROKU_URL + bot.token);
}
else {
  bot = new Bot(token, { polling: true });
}

console.log('Bot server started in the ' + process.env.NODE_ENV + ' mode');

bot.on('message', async (msg) => {
  // console.log(msg);
  try {
    const text = msg.text;
    console.log(text);
    const res = await axios.get("http://35.79.22.161/predict", { params: { question: text } });
    console.log(res.data.answer);
    bot.sendMessage(msg.chat.id, res.data.answer).then(() => {});  
  } catch(e) {
    console.log(e.message);
  }
  
});

module.exports = bot;
