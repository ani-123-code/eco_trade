const express = require('express');
const router = express.Router();
const {
  getCollections,
  getCollectionById,
  getCollectionBySlug,
  getCollectionsGrouped,
  createCollection,
  updateCollection,
  deleteCollection,
  reorderCollections
} = require('../controllers/collectionController');
const { protect, admin } = require('../middlewares/auth');

router.get('/grouped', getCollectionsGrouped);
router.get('/slug/:slug', getCollectionBySlug);
router.post('/reorder', protect, admin, reorderCollections);

router.route('/')
  .get(getCollections)
  .post(protect, admin, createCollection);

router.route('/:id')
  .get(getCollectionById)
  .put(protect, admin, updateCollection)
  .delete(protect, admin, deleteCollection);

module.exports = router;
