const express = require("express");
const app = express();

// Middleware for parsing JSON in request bodies
app.use(express.json());

app.post("/respondio", (req, res) => {
  const phoneNumber = req.body.contact.phone;
  const messageText = req.body.message.message.text;

  console.log(`Received message from ${phoneNumber}: ${messageText}`);

  // Respond to the request to acknowledge receipt
  res.status(200).end();
});

app.listen(3001, () => {
  console.log("Server is listening on port 3001");
});
