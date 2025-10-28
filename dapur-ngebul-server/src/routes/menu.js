const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

router.get('/', menuController.list);
router.get('/categories', menuController.categories);

module.exports = router;
