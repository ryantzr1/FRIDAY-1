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
  customerFirstName: { type: String, required: false },
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

//whenever we close the convo, this updates the failureCount back to 0
//this simulates how when DashcamSG closes the convo, FRIDAY will be there to answer
//to get around this, on our dashboard we can show the user whom Dashcam has yet to answer!!!
app.post("/conversationClosed", async (req, res) => {
  const signature = req.get("X-Webhook-Signature");
  const signingKey = "DdH/wg/I/zhJQNpPAe7WDWKwSqAa/ofybvEqM1927nA=";

  const expectedSignature = createHmac("sha256", signingKey)
    .update(JSON.stringify(req.body))
    .digest("base64");

  if (signature !== expectedSignature) {
    return res.status(400).json({
      message: "Invalid signature",
    });
  }

  const userId = req.body.contact.id; //this is the identifier for the respond.io API to use anyways

  console.log("Conversation closed for " + userId);

  async function removeDocuments() {
    try {
      const result = await Query.deleteMany({ userId: "86028224" });
      console.log(`${result.deletedCount} documents deleted.`);
    } catch (error) {
      console.error("Error occurred while removing documents:", error);
    }
  }

  //   removeDocuments();

  //checking the previous failure count to update the current failure count
  let mongoCustomer;
  try {
    mongoCustomer = await Query.findOne({ userId: userId }).sort({
      timestamp: -1,
    });
    mongoCustomer.failureCount = 0;
    await mongoCustomer.save();
  } catch (error) {
    console.error(
      `ignore this error it will never happen in real life ${userId}:`
    );
  }

  // Respond to the webhook request to acknowledge receipt
  res.status(200).end();
});

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
  const customerFirstName = req.body.contact.firstName; //this is to show Dashcam which user they need to reply to in event of no answer

  console.log(`Received message from ${userId}: ${messageText}`);
  console.log("This is the channelId" + " " + channelId);

  //asking FRIDAY
  let requestBody = {
    chat_history: [],
    company_info: {
      company_desc: "DashcamSG, a company that sells car accessories",
      company_name: "DashcamSG",
      product_list: ["A500s"],
      tools: ["PriceList", "Schedule", "VectorDatabase"],
      usable_tools: ["VectorDatabase"],
    },
  };

  const apiEndpoint = "http://18.183.218.48/predict"; //FRIDAY endpoint
  const question = messageText;

  const encodedQuestion = encodeURIComponent(question);
  const url = `${apiEndpoint}?question=${encodedQuestion}`;

  const responseAI = await axios.post(url, requestBody);
  let answer = responseAI.data.answer; //FRIDAY's ANSWER

  //***NEED TO IMPLEMENT CATCH WHEN FRIDAY IS DOWN OR RATE LIMITED */
  success =
    !answer.includes("[NO ANSWER]") &&
    !answer.includes("Flagged as") &&
    !answer.includes("context");

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

  //checking the previous failure count to update the current failure count
  let prevQuery;
  try {
    prevQuery = await Query.findOne({ userId: userId }).sort({
      timestamp: -1,
    });
  } catch (error) {
    console.error(`Error fetching previous query for user ${userId}:`);
  }

  let failureCount = 0; // Default value

  if (prevQuery && !isNaN(prevQuery.failureCount)) {
    console.log(prevQuery);
    console.log(prevQuery.failureCount + "This is prev failure count");
    failureCount = !success ? prevQuery.failureCount + 1 : 0; // Increment failureCount if the response is not successful
    console.log("we have updated failure Count " + failureCount);
  }

  const query = new Query({
    question: question,
    answer: answer,
    userId: userId,
    customerFirstName: customerFirstName,
    success: success,
    history: currentHistory,
    company: "DashcamSG",
    failureCount: failureCount, // This is where the updated failureCount is saved
  });

  await query
    .save()
    .then()
    .catch((e) => console.log(e));

  console.log("Updated failureCount:", failureCount);

  // Decide the response based on the count of consecutive failed responses
  if (!success && failureCount < 2) {
    answer = "Sorry, we didn't understand your question, please try again.";
  } else if (!success && failureCount >= 2) {
    answer =
      "We did not get your question, please hold as our team will be with you shortly.";
  }

  // Send a reply to the incoming message using Respond.io
  // If more than 2 failures we just leave it open and wait for DashcamSG team to reply
  try {
    if (failureCount < 3) {
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
    } else {
      // Assign the conversation to jarvis@dashcam.sg (eventually)
      await axios.post(
        `${apiUrl}/contact/id:${userId}/conversation/assignee`,
        {
          assignee: "ask.fridaytech@gmail.com",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Assigned conversation to ask.fridaytech@gmail.com");
    }
  } catch (error) {
    console.error(
      "Failed to send reply or assign conversation:",
      error.response.data
    );
  }

  try {
    if (success && failureCount < 2) {
      await axios.post(
        `${apiUrl}/contact/id:${userId}/conversation/status`,
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
  } catch (error) {
    console.error(`Error closing conversation for user ${userId}:`, error);
    // Handle error, for example by sending a response with a status code
  }
  // Respond to the webhook request to acknowledge receipt
  res.status(200).end();
});

app.listen(3001, () => {
  console.log("Server is listening on port 3001");
});
