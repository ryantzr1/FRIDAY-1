const express = require("express");
const bodyParser = require("body-parser");
const packageInfo = require("./package.json");
const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to your database"))
  .catch((err) => console.log(err));

app.get("/", function (req, res) {
  res.json({ version: packageInfo.version });
});

var server = app.listen(process.env.PORT, "0.0.0.0", () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log("Web server started at http://%s:%s", host, port);
});

module.exports = (bot) => {
  app.post("/" + bot.token, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });
};
