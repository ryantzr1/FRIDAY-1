if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");

const mongoose = require("mongoose");

const port = process.env.PORT || "3000";
const dbUrl = process.env.DB_URL || "mongodb://localhost:3000/fridaybackend";

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Define the MongoDB schema for storing queries
const querySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  success: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now },
  history: { type: Array, required: true },
  company: { type: String, required: true },
});
const Query = mongoose.model("Query", querySchema);

// Set up the MongoDB connection
mongoose
  .connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Define the route for handling GET requests
let counter = 0;

app.get("/", async (req, res) => {
  try {
    res.send({
      // answer: query.answer
      answer: "Wrong Endpoint",
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
});

app.get("/queries", async (req, res) => {
  try {
    const apiEndpoint = "http://18.183.218.48/predict";

    const question = req.body.question;

    let processedQuestion = question.trim();

    if (!processedQuestion.endsWith("?")) {
      processedQuestion += "?"; // add question mark if not already present
    }

    const userId = req.body.id;

    // Encode the question using encodeURIComponent()
    const encodedQuestion = encodeURIComponent(processedQuestion);

    // Construct the URL with the encoded question as a query string parameter
    const url = `${apiEndpoint}?question=${encodedQuestion}`;

    console.log(url);

    console.log(userId);

    let requestBody = {
      chat_history: [],
      company_info: {
        company_desc: "DashcamSG, a company that sells car accessories",
        company_name: "DashcamSG",
        product_list: ["A500s"],
        tools: ["Schedule", "PriceList", "VectorDatabase"],
        usable_tools: ["VectorDatabase"],
      },
    };

    const prevConvoArr = await Query.find({ userId: userId });

    if (prevConvoArr.length != 0) {
      const previousHistory = prevConvoArr[prevConvoArr.length - 1].history;
      requestBody = {
        chat_history: previousHistory,
        company_info: requestBody.company_info,
      };
    }

    console.log(requestBody);

    const responseAI = await axios.post(url, requestBody);

    const answer = responseAI.data.answer;

    const agent = responseAI.data.agent;

    console.log(answer);

    console.log(agent);

    const type = agent.includes("vector")
      ? "[ITEM]"
      : agent.includes("schedule")
      ? "[SCHEDULE]"
      : "[PRICE]";

    console.log(type);

    const success = !answer.includes("[NO ANSWER]");

    let currentHistory = [
      {
        role: "user",
        content: processedQuestion,
      },
      {
        role: "assistant",
        content: answer,
      },
    ];

    if (prevConvoArr.length != 0) {
      previousHistory = prevConvoArr[prevConvoArr.length - 1].history;
      currentHistory = previousHistory.concat(currentHistory);
    }

    // Save the query to the MongoDB database
    const query = new Query({
      question: processedQuestion,
      answer: answer,
      userId: userId,
      success: success,
      history: currentHistory,
      company: "DashcamSG",
    });

    await query
      .save()
      .then()
      .catch((e) => console.log(e));

    res.send({
      answer: query.answer,
      agent: type,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
});

app.get("/queries/log", async (req, res) => {
  try {
    const queries = await Query.find().sort({ _id: -1 });
    const totalQueriesCount = await Query.countDocuments();
    const unansweredQueriesCount = await Query.countDocuments({
      success: false,
    });
    res.json({ queries, totalQueriesCount, unansweredQueriesCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/response", async (req, res) => {
  const question = req.body.question;
  console.log(question);
  if (!question) {
    return res.status(400).json({ error: "Missing 'q' parameter" });
  }
  console.log("Here");
  try {
    const result = await findQuestion(question);
    console.log(result);
    if (result) {
      res.send({
        answer: result,
      });
    } else {
      res.status(404).json({ error: "Question not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

async function findQuestion(question) {
  let processedQuestion = question.trim();

  if (!processedQuestion.endsWith("?")) {
    processedQuestion += "?"; // add question mark if not already present
  }

  console.log(processedQuestion);

  const result = await Query.findOne({
    question: processedQuestion.toString(),
  });
  console.log(result);
  return result.answer;
}

// app.post("/queries", async (req, res) => {
//   // console.log(req);
//   try {
//     const question = req.body.text;
//     const token = req.body.token;
//     console.log(question);
//     console.log(token);

//     if (token !== TOKEN) {
//       return res.status(401).json({ error: "Invalid token." }); // Return an error if the token is invalid
//     }

//     counter++; // Increase the counter if the token is valid

//     // Call the machine learning API to get the answer
//     const response = await axios.get("http://54.238.198.35/predict", {
//       params: {
//         question: question,
//       },
//     });

//     // Extract the answer from the API response
//     const answer = response.data.answer;

//     console.log(answer);

//     // Save the query to the MongoDB database
//     // const query = new Query({ question: question, answer: answer });
//     // await query.save();

//     // Send the response back to the client
//     res.json({ question: question, answer: answer });
//   } catch (error) {
//     console.error("Error processing request:", error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while processing your request." });
//   }
// });

// Start the server
app.listen(port, () => {
  console.log("Server is listening on port " + port + "!");
});
