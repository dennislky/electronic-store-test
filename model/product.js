const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  price: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Product", productSchema);
