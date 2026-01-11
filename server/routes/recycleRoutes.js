const express = require('express');
const router = express.Router();
const {
  createRecycleRequest,
  getAllRecycleRequests,
  getRecycleRequestById,
  updateRecycleRequest,
  deleteRecycleRequest
} = require('../controllers/recycleController');
const { protect, admin } = require('../middlewares/auth');

// Public route for creating recycle requests
router.post('/', createRecycleRequest);

// Admin routes (require authentication)
router.get('/', protect, admin, getAllRecycleRequests);
router.get('/:id', protect, admin, getRecycleRequestById);
router.put('/:id', protect, admin, updateRecycleRequest);
router.delete('/:id', protect, admin, deleteRecycleRequest);

module.exports = router;