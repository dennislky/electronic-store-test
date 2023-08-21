const express = require("express");
const router = express.Router();
const DiscountDealController = require("../controller/discountDeal");

router.post("/", DiscountDealController.create);
router.delete("/:id", DiscountDealController.delete);

router.get("/", DiscountDealController.getDiscountDeals);
router.get("/:id", DiscountDealController.getDiscountDeal);

router.put("/", DiscountDealController.notImplemented);
router.patch("/", DiscountDealController.notImplemented);
router.delete("/", DiscountDealController.notImplemented);

router.post("/:id", DiscountDealController.notImplemented);
router.put("/:id", DiscountDealController.notImplemented);
router.patch("/:id", DiscountDealController.notImplemented);

module.exports = router;
