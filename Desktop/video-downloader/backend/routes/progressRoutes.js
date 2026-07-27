const express = require('express');
const router = express.Router();

const progressController = require('../controllers/progressController');

router.get('/:id', progressController.getProgress);

module.exports = router;