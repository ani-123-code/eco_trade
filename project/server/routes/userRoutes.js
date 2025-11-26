const express = require('express');
const router = express.Router();
const { getUsers, getDashboardStats } = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/auth');

router.get('/', protect, admin, getUsers);
router.get('/dashboard', protect, admin, getDashboardStats);

module.exports = router;