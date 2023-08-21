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
              const basket = new Basket({
                userId: req.params.id,
                items: [
                  {
                    productId: action.productId,
                    quantity: action.quantity,
                    actionTimestamp: action.timestamp,
                  },
                ],
              });
              await basket.save();
              res.status(200).json(basket.toJSON());
            } else {
              const itemIndex = doc.items.findIndex(
                (item) =>
                  item.productId.toString() === action.productId.toString()
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
                (item) =>
                  item.productId.toString() === action.productId.toString()
              );
              const item = doc.items[itemIndex];
              if (item) {
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
              } else {
                res.status(400).json({ errorMessage: "no such item" });
              }
            }
            break;
          case "discountDeal":
            doc.appliedDiscountDealId = action.discountDealId;
            await doc.save();
            res.status(200).json(doc.toJSON());
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
        res.status(404).send("id not found");
      }
      return;
    } catch (err) {
      return next(err);
    }
  },
  getBasketReceipt: async (req, res, next) => {
    try {
      const basket = await Basket.findOne({ userId: req.params.id })
        .populate({
          path: "appliedDiscountDealId",
        })
        .populate({
          path: "items",
          populate: { path: "productId" },
        });
      if (basket) {
        const totalPriceWithoutDiscountDeal = basket.items.reduce(
          (total, item) => {
            total += item.productId.price * item.quantity;
            return total;
          },
          0
        );
        let discount = 0;
        const discountDeal = basket.appliedDiscountDealId;
        switch (discountDeal.type) {
          case "buy1Get1Free":
            const itemBuy1Get1Free = basket.items.find(
              (item) =>
                item.productId._id.toString() ===
                discountDeal.productId[0].toString()
            );
            if (itemBuy1Get1Free) {
              discount =
                itemBuy1Get1Free.productId.price *
                Math.floor(itemBuy1Get1Free.quantity / 2);
            }
            break;
          case "buy1Get50PercentOffTheSecond":
            const itemBuy1Get50PercentOffTheSecond = basket.items.find(
              (item) =>
                item.productId._id.toString() ===
                discountDeal.productId[0].toString()
            );
            if (itemBuy1Get50PercentOffTheSecond) {
              discount =
                itemBuy1Get50PercentOffTheSecond.productId.price *
                Math.floor(itemBuy1Get50PercentOffTheSecond.quantity / 2) *
                0.5;
            }
            break;
          case "bundleDiscount":
            const item1 = basket.items.find(
              (item) =>
                item.productId._id.toString() ===
                discountDeal.productId[0].toString()
            );
            const item2 = basket.items.find(
              (item) =>
                item.productId._id.toString() ===
                discountDeal.productId[1].toString()
            );
            if (item1 && item2) {
              discount =
                Math.min(item1.quantity, item2.quantity) *
                (item1.productId.price + item2.productId.price) *
                (1 - discountDeal.percentage);
            }
            break;
          default:
            res
              .status(400)
              .json({ errorMessage: "applied discount deal type is wrong" });
            return;
        }
        const receipt = {
          purchasedItems: basket.items,
          appliedDiscountDeal: basket.appliedDiscountDealId,
          totalPrice: totalPriceWithoutDiscountDeal - discount,
        };
        res.status(200).json(receipt);
      } else {
        res.status(404).send("userId not found");
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
