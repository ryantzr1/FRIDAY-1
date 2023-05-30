if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");

const mongoose = require("mongoose");

const port = process.env.PORT || "27027";
const dbUrl = process.env.DB_URL || "mongodb://localhost:27027/fridaybackend";

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Define the MongoDB schema for storing queries
const querySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  mobile: { type: Number, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, required: true },
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

// Main Query Endpoint

app.get("/queries", async (req, res) => {
  try {
    const apiEndpoint = "http://43.207.93.240/predict";

    // Question Extraction

    const question = req.body.question;
    // const question = req.query.question;

    // Question Processing

    let processedQuestion = question.trim();

    if (!processedQuestion.endsWith("?")) {
      processedQuestion += "?"; // add question mark if not already present
    }
  
    const encodedQuestion = encodeURIComponent(processedQuestion); // Encode the question using encodeURIComponent()

    // Parameter Extraction

    // const userId = req.query.id;
    // const name = req.query.name;
    // const mobile = req.query.mobile;

    const userId = req.body.id;
    const name = req.body.name;
    const mobile = req.body.phone;

    // Category Extraction (For training data)
    
    // const category = req.query.category;

    // Construct the URL with the encoded question as a query string parameter

    const url = `${apiEndpoint}?question=${encodedQuestion}`;

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

    const responseAI = await axios.post(url, requestBody);

    const answer = responseAI.data.answer;

    const agent = responseAI.data.agent;

    // Temporary type variable to be sent to client (Legacy)

    const type = agent.includes("vector")
      ? "[ITEM]"
      : agent.includes("schedule")
      ? "[SCHEDULE]"
      : "[PRICE]";

    // Temporary Category Variable based on AI model (Legacy)

    const category = agent.includes("vector")
    ? "Product"
    : agent.includes("schedule")
    ? "Scheduling"
    : "Price List";

    // Determine success

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

    console.log("Category: " + category);
    
    // Save the query to the MongoDB database
    const query = new Query({
      name: name,
      mobile: mobile,
      question: processedQuestion,
      answer: answer,
      category: category,
      userId: userId,
      success: success,
      history: currentHistory,
      company: "DashcamSG",
    });

    console.log("Query Saved: " + query);

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

// API Endpoint for MongoDB database

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

app.post("/updateCategory", async (req, res) => {
  const id = req.body.id;
  const newCategory = req.body.category;

  try {
    const updatedItem = await Query.findByIdAndUpdate(
      id,
      { category: newCategory },
      { new: true }
    );

    console.log("Updated Item:", updatedItem);

    res.send(updatedItem);
  } catch (error) {
    console.error("Error updating category:", error.message);
    res.status(500).send("Error updating category");
  }
});

// API endpoints to communicate with PINECONE database

app.get("/retrieve", async (req, res) => {
  const product = req.query.product;
  const url = "http://52.192.225.247/get_all_items";
  const params = {
    root_name: "DashcamSG",
    loc: product,
  };

  try {
    const response = await axios.get(url, { params });
    const data = response.data.items;
    res.send({ data });
  } catch (error) {
    console.error("Error retrieving items:", error.message);
  }
});

app.get("/test", async (req, res) => {
  const url = "http://52.192.225.247/get_all_items";
  const params = {
    root_name: "DashcamSG",
    loc: "A500S",
  };

  try {
    const response = await axios.get(url, { params });
    const data = response.data.items;
    res.send({ data });
  } catch (error) {
    console.error("Error retrieving items:", error.message);
  }
});

app.post('/update', async (req, res) => {
  try {
    // Retrieve the body of the post request
    const requestBody = req.body;
    const rootName = 'DashcamSG';
    const childName = requestBody.childName;
    const text = requestBody.items;
    const items = text.split('\n\n');
    console.log(items);

    // Delete the child endpoint
    await axios.post(
      `http://52.192.225.247/delete_child?root_name=${rootName}&loc=${childName}`
    );

    // Create a new child endpoint
    await axios.post(
      `http://52.192.225.247/create_leaf_child?name=${childName}&root_name=${rootName}`
    );

    // Insert all with the information in the body of the post request  
    await axios.post(`http://52.192.225.247/insert_all?root_name=${rootName}&loc=${childName}`, {
      items: items
    });

    res.status(200).json({ message: 'Update successful' });
    
  } catch (error) {
    console.error('Error updating child item:', error.message);
    res.status(500).json({ error: 'Update failed' });
  }
});

// Start the server
app.listen(port, () => {
  console.log("Server is listening on port " + port + "!");
});
