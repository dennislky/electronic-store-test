const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  id: {
    type: Number,
    autoCreate: true,
    unique: true,
    index: true,
    default: 1,
  },
  name: {
    type: String,
    unique: true,
    index: true,
  },
  price: Number,
});

productSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret, options) => {
    delete ret._id;
  },
});

const counterSchema = new mongoose.Schema({
  seq: { type: Number, default: 0 },
});
const counter = mongoose.model("counter", counterSchema);
productSchema.pre("save", function (next) {
  const doc = this;
  counter.findOneAndUpdate(
    {},
    { $inc: { seq: 1 } },
    { upsert: true, new: true },
    function (err, counter) {
      if (err) return next(err);
      doc.id = counter.seq;
      next();
    }
  );
});

module.exports = mongoose.model("Product", productSchema);
