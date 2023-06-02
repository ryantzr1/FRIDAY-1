const mongoose = require('mongoose');

// Define the MongoDB schema for storing user information
const userSchema = new mongoose.Schema({
  UID: { type: String, required: true },
  name: { type: String, required: true },
  limit: { type: Number, required: true },
  products: { type: Array, required: true },
  questionCategories: { type: Array, required: true },
  APIKey: { type: String }
});

exports.User = mongoose.models.User || mongoose.model("User", userSchema);
