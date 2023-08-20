const mongoose = require("mongoose");

const basketSchema = new mongoose.Schema({
  userId: {
    type: Number,
    autoCreate: true,
    unique: true,
    index: true,
    default: 1,
  },
  items: [
    {
      productId: {
        type: Number,
        required: true,
        unique: true,
        index: true,
      },
      quantity: Number,
      actionTimestamp: Number,
    },
  ],
  appliedDiscountDealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "discountDeal",
  },
});

module.exports = mongoose.model("Basket", basketSchema);
