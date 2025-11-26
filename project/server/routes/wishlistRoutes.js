const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const wishlistController = require('../controllers/wishlistController');

router.get('/', protect, wishlistController.getWishlist);
router.post('/add', protect, wishlistController.addToWishlist);
router.post('/toggle', protect, wishlistController.toggleWishlist);
router.delete('/:productId', protect, wishlistController.removeFromWishlist);

module.exports = router;
