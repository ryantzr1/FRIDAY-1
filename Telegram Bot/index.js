require('dotenv').config()
const axios = require('axios')
const express = require('express')
const parser = require('body-parser')
// const { spawn } = require("child_process"); 

const { TOKEN, SERVER_URL } = process.env
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`
const link = `/webhook/${TOKEN}`
const MAIN_URL = SERVER_URL + link

const app = express()
app.use(parser.json())

app.post(link, async (req, res) => {
    console.log(req.body)

    try {
        const userId = req.body.message.chat.id
        const text = req.body.message.text
        if (text === "/start") {
            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                chat_id: userId,
                text: "Hello! How may I help you?"
            })
        }
        else {
            if (text === undefined) {
                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                    chat_id: userId,
                    text: "This message is invalid. Please send another message."
                })
            } else {
                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                    chat_id: userId,
                    text: "Hello " + text
                })
            }
        }        
    }
    catch {
        console.log("Failed");
    }
    return res.send()
})
// // runMLScript runs our ML model when a new conversation with the customer starts
// async function runMLScript(parameter) {
//   return new Promise((resolve, reject) => {
//     const python = spawn("python3", [
//       "", ///To fill in with the script name!!! 
//       parameter,
//     ]);
//     let output = "";
//     python.stdout.on("data", (data) => {
//       console.log(`stdout: ${data}`);
//       output += data;
//     });

//     python.stderr.on("data", (data) => {
//       // console.log(`stderr: ${data}`);
//     });

//     python.on("close", (code) => {
//       // console.log(`child process exited with code ${code}`);
//       const results = output;
//       resolve(results);
//     });
//   });
// }


// app.post("/predict", async (req, res) => {
//   console.log("Making Predictions now");
//     try {
//         const text = req.body.message.text
//         const results = await runMLScript(text); //running ML script to get the results
//         console.log(results);
//         await axios.post(`${TELEGRAM_API}/sendMessage`, {
//                     chat_id: userId,
//                     text: "Hello " + text
//                 })               //Gerald will need you to check this sendMessage Function
//      } 
//      catch (error) {
//         console.error(error);
//         res.status(500).send({ error: "An error occurred" });
//      }
//      return res.send()
//}) 





const init = async () => {
    const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${MAIN_URL}`)
    console.log(res.data)
}

app.listen(process.env.PORT || 5000, async () => {
    console.log('🚀 app running on port', process.env.PORT || 5000)
    await init()
})
