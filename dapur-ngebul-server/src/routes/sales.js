const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

router.get('/', salesController.summary);
router.get('/today', salesController.today);
router.get('/month-to-date', salesController.monthToDate);
router.get('/all-time', salesController.allTime);

module.exports = router;
