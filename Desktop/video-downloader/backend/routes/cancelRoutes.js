const express = require("express");

const router = express.Router();

const cancelController =
require("../controllers/cancelController");

router.post(
    "/:id",
    cancelController.cancelDownload
);

module.exports = router;
