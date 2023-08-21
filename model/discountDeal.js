const mongoose = require("mongoose");

const discountDealType = [
  "buy1Get1Free",
  "buy1Get50PercentOffTheSecond",
  "bundleDiscount",
];

const discountDealSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    unique: true,
    index: true,
    enum: discountDealType,
  },
  productId: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "product",
    required: true,
  },
  percentage: Number,
});

module.exports = mongoose.model("DiscountDeal", discountDealSchema);
