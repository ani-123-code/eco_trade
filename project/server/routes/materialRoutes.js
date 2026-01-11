const express = require('express');
const router = express.Router();
const {
  createMaterial,
  getMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
  verifyMaterial,
  getSellerMaterials
} = require('../controllers/materialController');
const { protect, admin } = require('../middlewares/auth');

// Public routes
router.get('/', getMaterials);

// Protected routes - MUST come before /:id route
router.get('/seller', protect, getSellerMaterials);
router.post('/', protect, createMaterial);

// Public/Protected routes with ID
router.get('/:id', getMaterialById);
router.put('/:id', protect, updateMaterial);
router.delete('/:id', protect, deleteMaterial);

// Admin routes
router.put('/:id/verify', protect, admin, verifyMaterial);

module.exports = router;

