const Product = require("../model/product");

const ProductController = {
  create: async (req, res, next) => {
    try {
      if (req.body) {
        const product = req.body;
        if (!product.name) {
          res.status(400).json({ errorMessage: "name is missing" });
          return;
        }
        if (!product.price) {
          res.status(400).json({ errorMessage: "price is missing" });
          return;
        }
        const doc = new Product(req.body);
        await doc.save();
        res.status(201).json(doc.toJSON());
      } else {
        res.status(400).json({ errorMessage: "post body is missing" });
      }
    } catch (err) {
      console.log(`Error: ${err.toString()}`);
      return next(err);
    }
  },
  delete: async (req, res, next) => {
    try {
      const doc = await Product.findOne({ _id: req.params.id });
      await doc.deleteOne({ _id: doc._id });
      res.status(200).json({ productId: doc._id });
      return;
    } catch (err) {
      console.log(`Error: ${err.toString()}`);
      return next(err);
    }
  },
  getProducts: async (_, res, next) => {
    try {
      const arr = await Product.find().sort({ id: "asc" });
      res.status(200).json(arr);
      return;
    } catch (err) {
      return next(err);
    }
  },
  getProduct: async (req, res, next) => {
    try {
      const doc = await Product.findOne({ id: req.params.id });
      if (doc) {
        res.status(200).json(doc);
      } else {
        res.status(404).send("ID not found");
      }
      return;
    } catch (err) {
      return next(err);
    }
  },
  notImplemented: (_, res) => {
    res.status(405).send();
  },
};

module.exports = ProductController;
