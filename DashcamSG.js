const express = require("express");
const bodyParser = require("body-parser");
const { createHmac } = require("crypto");
const axios = require("axios");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define the MongoDB schema for storing queries
const querySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  success: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now },
  history: { type: Array, required: true },
  company: { type: String, required: true },
  failureCount: { type: Number, required: false },
});
const Query = mongoose.model("Query", querySchema);

// Set up the MongoDB connection
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

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

  const userId = req.body.contact.id; //this is the identifier for the respond.io API to use anyways
  const messageText = req.body.message.message.text; //message to send to FRIDAY
  const channelId = req.body.message.channelId;

  console.log(`Received message from ${userId}: ${messageText}`);
  console.log("This is the channelId" + " " + channelId);

  //asking FRIDAY
  let requestBody = {
    chat_history: [],
    company_info: {
      company_desc: "DashcamSG, a company that sells car accessories",
      company_name: "DashcamSG",
      product_list: ["A500s"],
      tools: ["VectorDatabase"],
      usable_tools: ["VectorDatabase"],
    },
  };

  const apiEndpoint = "http://18.183.218.48/test";
  const question = messageText;

  const encodedQuestion = encodeURIComponent(question);
  const url = `${apiEndpoint}?question=${encodedQuestion}`;

  const responseAI = await axios.post(url, requestBody);
  let answer = responseAI.data.answer; //FRIDAY's ANSWER
  const agent = responseAI.data.agent;

  const success =
    !answer.includes("[NO ANSWER]") && !answer.includes("Flagged as");

  //Calling our mongoDB
  let currentHistory = [
    {
      role: "user",
      content: question,
    },
    {
      role: "assistant",
      content: answer,
    },
  ];
  const prevQuery = await Query.findOne({ userId: userId }).sort({
    createdAt: -1,
  });

  let failureCount = 0; // Default value

  if (prevQuery) {
    failureCount = prevQuery.failureCount; // Extract failureCount if document exists
  }

  const query = new Query({
    question: question,
    answer: answer,
    userId: userId,
    success: success,
    history: currentHistory,
    company: "DashcamSG",
    failureCount: failureCount,
  });

  await query
    .save()
    .then()
    .catch((e) => console.log(e));

  const mongoCustomer = await Query.findOne({
    //want to get the Message Object from MongoDB to check number of failures
    question: question.toString(),
  });

  // Update the count of consecutive failed responses for this user
  if (!success) {
    mongoCustomer.failureCount++;
    await mongoCustomer.save();
  } else {
    // Reset the count if the response was successful
    mongoCustomer.failureCount = 0;
    await mongoCustomer.save();
  }

  // Decide the response based on the count of consecutive failed responses
  if (!success && mongoCustomer.failureCount < 2) {
    answer = "Sorry, we didn't understand your question, please try again.";
  } else if (!success && mongoCustomer.failureCount == 2) {
    answer =
      "We did not get your question, please hold as our team will be with you shortly.";
  }
  //yeah then if more than 2 failures we just leave it open and wait for DashcamSG team to reply

  // Send a reply to the incoming message
  try {
    const response = await axios.post(
      `${apiUrl}/contact/id:${userId}/message`,
      {
        channelId: 138265,
        message: {
          type: "text",
          text: answer,
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

  //   // Close the conversation if the failure count is less than 2
  if (user.failureCount < 2) {
    await axios.post(
      "https://api.respond.io/v2/contact/" +
        phoneNumber +
        "/conversation/status",
      {
        status: "close",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Replace with your actual token
        },
      }
    );
  }

  // Respond to the request to acknowledge receipt

  res.status(200).end();
});

app.listen(3001, () => {
  console.log("Server is listening on port 3001");
});
