const mongoose = require('mongoose');

// Define the MongoDB schema for storing queries
const querySchema = new mongoose.Schema({
  userId: { type: String },
  name: { type: String },
  mobile: { type: Number },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, required: true },
  success: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now },
  history: { type: Array },
  company: { type: String, required: true },
});

exports.Query = mongoose.models.Query || mongoose.model("Query", querySchema);
