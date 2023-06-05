//Authenticate API requests from customers
const crypto = require("crypto");
const mongoose = require("mongoose");
const User = mongoose.model("User");

function generateHash(key) {
  return crypto.createHash("sha256").update(key).digest("hex");
}

module.exports.authenticateRequest = async function (req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No authorization header provided" });
  }

  const authParts = authHeader.split(" ");

  if (authParts.length !== 2 || authParts[0].toLowerCase() !== "basic") {
    return res
      .status(401)
      .json({ error: "Invalid authorization header format" });
  }

  const apiKey = Buffer.from(authParts[1], "base64").toString();

  console.log(apiKey);
  console.log(generateHash(apiKey));
  // Find the customer by their API key
  const customer = await User.findOne({ APIKey: generateHash(apiKey) });

  if (!customer) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  next();
};
