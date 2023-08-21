const express = require("express");
const router = express.Router();
const ProductController = require("../controller/product");

router.post("/", ProductController.create);
router.delete("/:id", ProductController.delete);

router.get("/", ProductController.getProducts);
router.get("/:id", ProductController.getProduct);

router.put("/", ProductController.notImplemented);
router.patch("/", ProductController.notImplemented);
router.delete("/", ProductController.notImplemented);

router.post("/:id", ProductController.notImplemented);
router.put("/:id", ProductController.notImplemented);
router.patch("/:id", ProductController.notImplemented);

module.exports = router;
