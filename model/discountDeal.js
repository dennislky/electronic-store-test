const mongoose = require("mongoose");

const discountDealSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    index: true,
  },
  price: Number,
});

module.exports = mongoose.model("DiscountDeal", discountDealSchema);
