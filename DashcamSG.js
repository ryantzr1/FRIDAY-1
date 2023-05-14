const express = require("express");
const bodyParser = require("body-parser");
const { createHmac } = require("crypto");
const axios = require("axios");

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Respond.io API configuration
const apiUrl = "https://api.respond.io/v2";
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTY3NCwic3BhY2VJZCI6MTQ0NDU0LCJvcmdJZCI6MTI1MDU2LCJ0eXBlIjoiYXBpIiwiaWF0IjoxNjgxMzE1MzUxfQ.XWGY5WbM9Rvp73zVpkdvLPa46BVoPoqFTiKzukKmK8M"; // Replace with your actual API token

app.post("/respond.io", async (req, res) => {
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

  // Send a reply to the incoming message
  try {
    const response = await axios.post(
      `${apiUrl}/contact/phone:${phoneNumber}/message`,
      {
        channelId: lastInteractedChannelId || null,
        message: {
          type: "text",
          text: "testing API.",
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
      "Reply sent successfully. Message ID:",
      response.data.messageId
    );
  } catch (error) {
    console.error("Failed to send reply:", error.response.data);
  }
  // Respond to the request to acknowledge receipt
  res.status(200).end();
});

app.listen(3001, () => {
  console.log("Server is listening on port 3001");
});
