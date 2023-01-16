const { Telegraf } = require('telegraf');
const TOKEN = "5528965625:AAG_Nt2Rr7RE98V6zVWymqJIHdmL-fEIqFY"

const bot = new Telegraf(TOKEN)

bot.start((ctx) => {
  ctx.reply('Welcome!')
})

const {spawn} = require('child_process')

async function runMLScript(parameter) {
    return new Promise((resolve, reject) => {
      const python = spawn("python", [
        "/Users/weihern/Documents/Computing Projects/FRIDAY/Machine Learning/src/main.py",
        parameter,
      ]);
      let output = "";
      python.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
        output += data;
      });
  
      python.stderr.on("data", (data) => {
        console.log(`stderr: ${data}`);
      });
  
      python.on("close", (code) => {
        console.log(`child process exited with code ${code}`);
        const results = output;
        resolve(results);
      });
    });
  }

   
  
bot.on('message', async (ctx) => {

 const response =  await runMLScript(ctx.message.text); 
 console.log(response);
  ctx.reply(`${response}`)
})

bot.launch()
