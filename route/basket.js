const express = require("express");
const router = express.Router();
const BasketController = require("../controller/basket");

router.get("/", BasketController.notImplemented);
router.post("/", BasketController.notImplemented);
router.put("/", BasketController.notImplemented);
router.patch("/", BasketController.notImplemented);
router.delete("/", BasketController.notImplemented);

router.get("/:id", BasketController.getBasket);
router.post("/:id", BasketController.notImplemented);
router.put("/:id", BasketController.notImplemented);
router.patch("/:id", BasketController.patch);
router.delete("/:id", BasketController.delete);

router.get("/:id/receipt", BasketController.getBasketReceipt);

module.exports = router;
