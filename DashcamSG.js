const express = require("express");
const bodyParser = require("body-parser");
const { createHmac } = require("crypto");

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/respond.io", (req, res) => {
  const signature = req.get("X-Webhook-Signature");
  const signingKey = "EpfaLRpQL9Iq6LuFbvbkrJICC5Qt4cZR8tkFmoumEvw=";

  const expectedSignature = createHmac("sha256", signingKey)
    .update(JSON.stringify(req.body))
    .digest("base64");

  if (signature !== expectedSignature) {
    return res.status(400).json({
      message: "Invalid signature",
    });
  }

  const phoneNumber = req.body.contact.phone; //this is the identifier for the respond.io API to use anyways
  const messageText = req.body.message.message.text; //message to send to FRIDAY

  console.log(`Received message from ${phoneNumber}: ${messageText}`);

  // Respond to the request to acknowledge receipt
  res.status(200).end();

  //for respond.io to respond with a message

  const axios = require("axios");

  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTY3NCwic3BhY2VJZCI6MTQ0NDU0LCJvcmdJZCI6MTI1MDU2LCJ0eXBlIjoiYXBpIiwiaWF0IjoxNjgxMzE1MzUxfQ.XWGY5WbM9Rvp73zVpkdvLPa46BVoPoqFTiKzukKmK8M"; // Replace with your actual API token

  const identifier = phoneNumber; // Replace with the identifier of the contact

  const sendMessage = async () => {
    try {
      const response = await axios.post(
        `https://api.respond.io/v2/contact/${identifier}/message`,
        {
          channelId: 0,
          message: {
            type: "text",
            text: "hello testing API",
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Message sent successfully. Message ID:",
        response.data.messageId
      );
    } catch (error) {
      console.error("Failed to send message:", error.response.data);
    }
  };

  sendMessage();

  app.listen(3001, () => {
    console.log("Server is listening on port 3001");
  });
});
