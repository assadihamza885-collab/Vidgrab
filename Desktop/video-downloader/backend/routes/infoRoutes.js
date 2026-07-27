const express = require('express');
const infoController = require('../controllers/infoController');

const router = express.Router();

router.post('/', infoController.getMediaInfo);

module.exports = router;