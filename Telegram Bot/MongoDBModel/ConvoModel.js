const mongoose = require("mongoose");

//format to create a new schema and model
// const schema = new mongoose.Schema({ name: 'string', size: 'string' });
// const Tank = mongoose.model('Tank', schema);

const Convo = new mongoose.Schema(
  {
    question: { type: String, required: true }, //Gerald can change the fields here to include what we capture in a convo
    answer: { type: String, required: true },
  },

  { timestamps: true }
);

//can import Convos into other files to access this model
const model = mongoose.model("Convo", Convo);

module.exports = model;
