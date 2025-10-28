const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/', orderController.create);
router.get('/:id', orderController.getById);
router.get('/', orderController.listByDate);
router.patch('/:id/status', orderController.updateStatus);

module.exports = router;
