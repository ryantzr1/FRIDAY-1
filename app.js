const express = require("express");
const app = express();
const bot = require("./bot");
const db = require("./databaseHandle");

// Listen to the correct port specified by Heroku
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
