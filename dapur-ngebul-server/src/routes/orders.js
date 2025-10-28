const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/', orderController.create);
router.get('/:id', orderController.getById);
router.get('/', orderController.listByDate);

module.exports = router;
