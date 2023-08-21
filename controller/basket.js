const Basket = require("../model/basket");

const BasketController = {
  patch: async (req, res, next) => {
    try {
      if (req.body) {
        const action = req.body;
        const doc = await Basket.findOne({ userId: req.params.id });
        switch (action.action) {
          case "add":
            if (!doc) {
              const doc = new Basket({
                userId: req.params.id,
                items: [
                  {
                    productId: action.productId,
                    quantity: action.quantity,
                    actionTimestamp: action.timestamp,
                  },
                ],
              });
              await doc.save();
              res.status(200).json(doc.toJSON());
            } else {
              const itemIndex = doc.items.findIndex(
                (item) => item.productId === action.productId
              );
              if (itemIndex >= 0) {
                const newItems = doc.items.map((item) => {
                  if (item.productId === action.productId) {
                    item.quantity += action.quantity;
                    item.actionTimestamp = action.timestamp;
                  }
                  return item;
                });
                doc.items = newItems;
              } else {
                doc.items.push({
                  productId: action.productId,
                  quantity: action.quantity,
                  actionTimestamp: action.timestamp,
                });
              }
              await doc.save();
              res.status(200).json(doc.toJSON());
            }
            break;
          case "remove":
            if (!doc) {
              res.status(400).json({ errorMessage: "no such basket" });
            } else {
              const itemIndex = doc.items.findIndex(
                (item) => item.productId === action.productId
              );
              const item = doc.items[itemIndex];
              if (item.quantity > action.quantity) {
                item.quantity -= action.quantity;
                item.actionTimestamp = action.timestamp;
                await doc.save();
                res.status(200).json(doc.toJSON());
              } else {
                doc.items.splice(itemIndex, 1);
                if (!doc.items.length) {
                  await doc.deleteOne({ userId: req.params.id });
                } else {
                  await doc.save();
                  res.status(200).json(doc.toJSON());
                }
              }
            }
            break;
          default:
            res.status(400).json({ errorMessage: "action is wrong/missing" });
            break;
        }
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
      const doc = await Basket.findOne({ userId: req.params.id });
      if (doc && doc.userId) {
        await doc.deleteOne({ userId: doc.userId });
        res.status(200).json({ userId: doc.userId });
      } else {
        res.status(400).json({ errorMessage: "no such basket" });
      }
      return;
    } catch (err) {
      console.log(`Error: ${err.toString()}`);
      return next(err);
    }
  },
  getBasket: async (req, res, next) => {
    try {
      const doc = await Basket.findOne({ id: req.params.id });
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
  getBasketReceipt: async (req, res, next) => {
    try {
      const doc = await Basket.findOne({ id: req.params.id });
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

module.exports = BasketController;
