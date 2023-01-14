require('dotenv').config()
const axios = require('axios')
const express = require('express')
const parser = require('body-parser')

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

const init = async () => {
    const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${MAIN_URL}`)
    console.log(res.data)
}

app.listen(process.env.PORT || 5000, async () => {
    console.log('🚀 app running on port', process.env.PORT || 5000)
    await init()
})