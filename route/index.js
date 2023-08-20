const express = require("express");
const router = express.Router();

/* GET home page. */
router.get("/", function (_, res, _) {
  res.send("<p>HTML Data</p>");
});

module.exports = router;
