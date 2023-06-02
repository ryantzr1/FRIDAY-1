if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}


const { Query } = require("./models/query");
const { User } = require("./models/user");

const auth = require("./Authentication");

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
/** 
Have your users provide their API keys as a header, like
curl -H "Authorization: apikey MY_APP_API_KEY" https://myapp.example.com
To authenticate a user’s API request, look up their API key in the database.
*/
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

    const prevConvoArr = await Query.find({ userId: userId });

    let currentHistory = [];

    if (prevConvoArr.length !== 0) {
      const threeDaysInMilliseconds = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
      const currentTimestamp = new Date().getTime();

      for (let i = 0; i < prevConvoArr.length; i++) {
        const { question, answer, timestamp } = prevConvoArr[i];

        if (currentTimestamp - timestamp <= threeDaysInMilliseconds) {
          const questionHistory = [
            {
              role: "user",
              content: question,
            },
            {
              role: "assistant",
              content: answer,
            },
          ];
          currentHistory = currentHistory.concat(questionHistory);
          console.log(currentHistory);
        }
      }
    }

    let requestBody = {
      chat_history: currentHistory,
      company_info: {
        company_desc: "DashcamSG, a company that sells car accessories",
        company_name: "DashcamSG",
        product_list: ["A500s"],
        tools: ["Schedule", "PriceList", "VectorDatabase"],
        usable_tools: ["VectorDatabase"],
      },
    };

    // console.log(requestBody);

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

    let addToHistory = [
      {
        role: "user",
        content: processedQuestion,
      },
      {
        role: "assistant",
        content: answer,
      },
    ];

    currentHistory.concat(addToHistory);

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

    // console.log("Query Saved: " + query);

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

  const questionArray = await Query.find({
    question: processedQuestion.toString(),
  });
  const result = questionArray[questionArray.length - 1];
  console.log(result);
  return result.answer;
}

app.get("/response", async (req, res) => {
  const question = req.body.question;
  // const question = req.query.question;

  console.log(question);

  if (!question) {
    return res.status(400).json({ error: "Missing 'q' parameter" });
  }
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

app.get("/userInfo", async (req, res) => {
  try {
    const UID = req.query.uid;
    const user = await User.findOne({ UID: UID });
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/userUpdate", async (req, res) => {
  const UID = req.query.uid;
  const { name, limit, products, questionCategories, APIKey } = req.body; // Assuming the information is sent in the request body

  try {
    // Find the user by UID and update the information
    const updatedUser = await User.findOneAndUpdate(
      { UID },
      { name, limit, products, questionCategories, APIKey },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User information updated", user: updatedUser });
  } catch (error) {
    console.error("Error updating user information:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/userCreate", async (req, res) => {
  const { UID, name, limit, products, questionCategories, APIKey } = req.query; // Assuming the information is sent as query parameters

  const adjustedLimit = limit != null ? limit : 0;
  const adjustedQuestionCategories =
    questionCategories != null ? products : ["Product"];

  try {
    // Create a new user object
    const newUser = new User({
      UID,
      name,
      limit: adjustedLimit,
      products,
      questionCategories: adjustedQuestionCategories,
      APIKey,
    });

    // Save the new user to the database
    const createdUser = await newUser.save();

    res.status(201).json({ message: "User created", user: createdUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

app.post("/update", async (req, res) => {
  try {
    // Retrieve the body of the post request
    const requestBody = req.body;
    const rootName = "DashcamSG";
    const childName = requestBody.childName;
    const text = requestBody.items;
    const items = text.split("\n\n");
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
    await axios.post(
      `http://52.192.225.247/insert_all?root_name=${rootName}&loc=${childName}`,
      {
        items: items,
      }
    );
    
    res.status(200).json({ message: "Update successful" });
  } catch (error) {
    console.error("Error updating child item:", error.message);
    res.status(500).json({ error: "Update failed" });
  }
});

app.post("/initialDatabasePopulation", async (req, res) => {
  // Retrieve the body of the post request
  const requestBody = req.body;
  const company = requestBody.company;
  const question = requestBody.question;
  const answer = requestBody.answer;
  const category = requestBody.category;

  const rootName = company + "_Categories";
  const childName = "root";

  const url = "http://52.192.225.247/get_all_items";
  const params = {
    root_name: rootName,
    loc: childName,
  };

  try {
    const response = await axios.get(url, { params });
    const data = response.data.items.concat(question);
    console.log(data);

    // Delete the child endpoint
    await axios.post(
      `http://52.192.225.247/delete_child?root_name=${rootName}&loc=${childName}`
    );

    // Create a new child endpoint
    await axios.post(
      `http://52.192.225.247/create_leaf_child?name=${childName}&root_name=${rootName}`
    );

    // Insert all with the information in the body of the post request
    await axios.post(
      `http://52.192.225.247/insert_all?root_name=${rootName}&loc=${childName}`,
      {
        items: data,
      }
    );

    // Create the query object
    const query = new Query({
      name: "Sample",
      question: question,
      answer: answer,
      category: category,
      success: true,
      company: company,
    });

    // Save the query object to the database
    await query.save();

    console.log("Query object saved successfully");
    res.send("Successful response"); // Send successful response

  } catch (error) {
    console.error("Error during database population:", error);
    res.status(500).send("Error response"); // Send error response
  }
});

// Start the server
app.listen(port, () => {
  console.log("Server is listening on port " + port + "!");
});
