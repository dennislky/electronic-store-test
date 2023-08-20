const mongoose = require("mongoose");

const discountDealSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  percentage: Number,
});

module.exports = mongoose.model("DiscountDeal", discountDealSchema);
