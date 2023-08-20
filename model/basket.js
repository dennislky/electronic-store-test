const mongoose = require("mongoose");

const basketSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    unique: true,
    index: true,
  },
  items: [
    {
      productId: {
        type: Number,
        unique: true,
        index: true,
      },
      quantity: Number,
      timestamp: Number,
    },
  ],
});

module.exports = mongoose.model("Basket", basketSchema);
