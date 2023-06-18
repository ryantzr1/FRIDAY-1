const mongoose = require("mongoose");

const SaladVentureSchema = new mongoose.Schema({
  username: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  success: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now },
  history: { type: Array, required: true },
  company: { type: String, required: true },
});

exports.SaladVenture =
  mongoose.models.SaladVenture ||
  mongoose.model("SaladVenture", SaladVentureSchema);