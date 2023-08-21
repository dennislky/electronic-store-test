const DiscountDeal = require("../model/discountDeal");

const DiscountDealController = {
  create: async (req, res, next) => {
    try {
      if (req.body) {
        const discountDeal = req.body;
        if (!discountDeal.type) {
          res.status(400).json({ errorMessage: "type is missing" });
          return;
        }
        const doc = new DiscountDeal(req.body);
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
      const doc = await DiscountDeal.findOne({ _id: req.params.id });
      if (doc && doc._id) {
        await doc.deleteOne({ _id: doc._id });
        res.status(200).json({ discountDealId: doc._id });
      } else {
        res.status(400).json({ errorMessage: "no such discount deal" });
      }
      return;
    } catch (err) {
      console.log(`Error: ${err.toString()}`);
      return next(err);
    }
  },
  getDiscountDeals: async (_, res, next) => {
    try {
      const arr = await DiscountDeal.find().sort({ id: "asc" });
      res.status(200).json(arr);
      return;
    } catch (err) {
      return next(err);
    }
  },
  getDiscountDeal: async (req, res, next) => {
    try {
      const doc = await DiscountDeal.findOne({ id: req.params.id });
      if (doc) {
        res.status(200).json(doc);
      } else {
        res.status(404).send("id not found");
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

module.exports = DiscountDealController;
