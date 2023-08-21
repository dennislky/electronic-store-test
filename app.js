const express = require("express");
const path = require("path");
const logger = require("morgan");
require("./connection")();

const indexRouter = require("./route/index");
const productRouter = require("./route/product");
const discountDealRouter = require("./route/discountDeal");
const basketRouter = require("./route/basket");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/product", productRouter);
app.use("/discountDeal", discountDealRouter);
app.use("/basket", basketRouter);

module.exports = app;
