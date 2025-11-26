const Collection = require('../models/Collection');
const Product = require('../models/Product');

const getCollections = async (req, res) => {
  try {
    const { parentCategory, includeInactive } = req.query;

    const query = {};
    if (parentCategory) {
      query.parentCategory = parentCategory;
    }
    if (!includeInactive) {
      query.isActive = true;
    }

    const collections = await Collection.find(query)
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    const collectionsWithCount = await Promise.all(
      collections.map(async (collection) => {
        const productCount = await Product.countDocuments({
          collection: collection._id
        });
        return {
          ...collection,
          productCount,
          id: collection._id.toString()
        };
      })
    );

    res.json(collectionsWithCount);
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({
      message: 'Server error fetching collections',
      error: error.message
    });
  }
};

const getCollectionById = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id).lean();

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    const productCount = await Product.countDocuments({
      collection: collection._id
    });

    res.json({
      ...collection,
      productCount,
      id: collection._id.toString()
    });
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({
      message: 'Server error fetching collection',
      error: error.message
    });
  }
};

const getCollectionBySlug = async (req, res) => {
  try {
    const collection = await Collection.findOne({
      slug: req.params.slug
    }).lean();

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    const productCount = await Product.countDocuments({
      collection: collection._id
    });

    res.json({
      ...collection,
      productCount,
      id: collection._id.toString()
    });
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({
      message: 'Server error fetching collection',
      error: error.message
    });
  }
};

const getCollectionsGrouped = async (req, res) => {
  try {
    const collections = await Collection.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    const grouped = {};

    for (const collection of collections) {
      const productCount = await Product.countDocuments({
        collection: collection._id
      });

      const parentCat = collection.parentCategory || 'Other';

      if (!grouped[parentCat]) {
        grouped[parentCat] = [];
      }

      grouped[parentCat].push({
        ...collection,
        productCount,
        id: collection._id.toString()
      });
    }

    res.json(grouped);
  } catch (error) {
    console.error('Error fetching grouped collections:', error);
    res.status(500).json({
      message: 'Server error fetching grouped collections',
      error: error.message
    });
  }
};

const createCollection = async (req, res) => {
  try {
    const { name, description, image, parentCategory, displayOrder, isActive } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Collection name is required' });
    }

    const existingCollection = await Collection.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingCollection) {
      return res.status(400).json({
        message: 'A collection with this name already exists'
      });
    }

    const collection = new Collection({
      name,
      description,
      image,
      parentCategory: parentCategory || 'More Electronics',
      displayOrder: displayOrder || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    const savedCollection = await collection.save();

    res.status(201).json({
      ...savedCollection.toObject(),
      productCount: 0,
      id: savedCollection._id.toString()
    });
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({
      message: 'Server error creating collection',
      error: error.message
    });
  }
};

const updateCollection = async (req, res) => {
  try {
    const { name, description, image, parentCategory, displayOrder, isActive } = req.body;

    const existingCollection = await Collection.findById(req.params.id);
    if (!existingCollection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (name && name !== existingCollection.name) {
      const duplicateCollection = await Collection.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });

      if (duplicateCollection) {
        return res.status(400).json({
          message: 'A collection with this name already exists'
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (parentCategory) updateData.parentCategory = parentCategory;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (name) {
      updateData.slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const collection = await Collection.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    const productCount = await Product.countDocuments({
      collection: collection._id
    });

    res.json({
      ...collection,
      productCount,
      id: collection._id.toString()
    });
  } catch (error) {
    console.error('Error updating collection:', error);
    res.status(500).json({
      message: 'Server error updating collection',
      error: error.message
    });
  }
};

const deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    const productCount = await Product.countDocuments({
      collection: collection._id
    });

    if (productCount > 0) {
      return res.status(400).json({
        message: `Cannot delete collection. ${productCount} product(s) are using this collection. Please reassign or delete those products first.`,
        productCount
      });
    }

    await Collection.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Collection deleted successfully',
      deletedId: req.params.id
    });
  } catch (error) {
    console.error('Error deleting collection:', error);
    res.status(500).json({
      message: 'Server error deleting collection',
      error: error.message
    });
  }
};

const reorderCollections = async (req, res) => {
  try {
    const { collections } = req.body;

    if (!Array.isArray(collections)) {
      return res.status(400).json({
        message: 'Collections array is required'
      });
    }

    const updatePromises = collections.map((item, index) =>
      Collection.findByIdAndUpdate(
        item.id,
        { displayOrder: index },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    res.json({ message: 'Collections reordered successfully' });
  } catch (error) {
    console.error('Error reordering collections:', error);
    res.status(500).json({
      message: 'Server error reordering collections',
      error: error.message
    });
  }
};

module.exports = {
  getCollections,
  getCollectionById,
  getCollectionBySlug,
  getCollectionsGrouped,
  createCollection,
  updateCollection,
  deleteCollection,
  reorderCollections
};
