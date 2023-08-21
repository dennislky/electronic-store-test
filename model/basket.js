const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    quantity: Number,
    actionTimestamp: Number,
  },
  { _id: false }
);

const basketSchema = new mongoose.Schema({
  userId: {
    type: Number,
    autoCreate: true,
    unique: true,
    index: true,
    default: 1,
  },
  items: [itemSchema],
  appliedDiscountDealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DiscountDeal",
  },
});

module.exports = mongoose.model("Basket", basketSchema);
