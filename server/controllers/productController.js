const Product = require('../models/Product');
const Collection = require('../models/Collection');
const Type = require('../models/Type');
const Order = require('../models/Order');
const { deleteFromS3, extractS3KeyFromUrl } = require('../utils/s3Upload');


// @desc    Get all products with server-side filtering
// @route   GET /api/products
const getProducts = async (req, res) => {
  try {
    const {
      collection,
      featured,
      newArrival,
      bestSeller,
      search,
      page = 1,
      limit = 12,
      sortBy = 'newest',
      minPrice,
      maxPrice,
      types,
      categories,
      condition,
      inStock
    } = req.query;

    const query = {};

    // Collection filter
    if (collection) {
      const collectionSlug = decodeURIComponent(collection).toLowerCase();
      const collectionDoc = await Collection.findOne({
        $or: [
          { slug: collectionSlug },
          { name: { $regex: new RegExp(`^${collectionSlug.replace(/-/g, ' ')}$`, 'i') } }
        ]
      });
      if (collectionDoc) {
        query.collection = collectionDoc._id;
      }
    }

    // Featured, new arrival, and best seller filters
    if (featured === 'true') query.featured = true;
    if (newArrival === 'true') query.newArrival = true;
    if (bestSeller === 'true') query.bestSeller = true; 

    // Search filter
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const matchingTypes = await Type.find({ name: searchRegex }).select('_id');

      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { warranty: searchRegex },
        { type: { $in: matchingTypes.map(t => t._id) } }
      ];
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.$or = [
        {
          $and: [
            { discountPrice: { $exists: true, $ne: null } },
            { discountPrice: { $gte: parseFloat(minPrice || 0) } },
            maxPrice !== 'undefined' ? { discountPrice: { $lte: parseFloat(maxPrice) } } : {}
          ].filter(Boolean)
        },
        {
          $and: [
            { $or: [{ discountPrice: { $exists: false } }, { discountPrice: null }] },
            { price: { $gte: parseFloat(minPrice || 0) } },
            maxPrice !== 'undefined' ? { price: { $lte: parseFloat(maxPrice) } } : {}
          ].filter(Boolean)
        }
      ];
    }

    // Type filter
    if (types) {
      const typeNames = types.split(',').map(type => type.trim());
      const typeDocs = await Type.find({
        name: { $in: typeNames }
      });
      const typeIds = typeDocs.map(type => type._id);

      if (typeIds.length > 0) {
        query.type = { $in: typeIds };
      }
    }

    // Categories filter (multiple categories)
    if (categories) {
      const categoryNames = categories.split(',').map(cat => cat.trim());
      const categoryDocs = await Collection.find({
        name: { $in: categoryNames },
        isActive: true
      });
      const categoryIds = categoryDocs.map(cat => cat._id);

      if (categoryIds.length > 0) {
        // If collection filter is already applied, use $or to combine
        if (query.collection) {
          query.$and = query.$and || [];
          query.$and.push({
            $or: [
              { collection: query.collection },
              { collection: { $in: categoryIds } }
            ]
          });
          delete query.collection;
        } else {
          query.collection = { $in: categoryIds };
        }
      }
    }

    // Condition filter
    if (condition) {
      const conditionValues = condition.split(',').map(c => c.trim());
      query.condition = { $in: conditionValues };
    }

    // Stock filter
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

     const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

     const pipeline = [];

    
    pipeline.push({ $match: query });

  pipeline.push({
      $addFields: {
        effectivePrice: {
          $ifNull: ["$discountPrice", "$price"]
        }
      }
    });


    // Sorting
    let sortStage = {};
    switch (sortBy) {
      case 'price-asc':
        sortStage = { $sort: { effectivePrice: 1 } };
        break;
      case 'price-desc':
        sortStage = { $sort: { effectivePrice: -1 } };
        break;
      case 'newest':
        sortStage = { $sort: { createdAt: -1 } };
        break;
      case 'rating':
        sortStage = { $sort: { rating: -1, reviewCount: -1 } };
        break;
      case 'name':
        sortStage = { $sort: { name: 1 } };
        break;
      case 'featured':
        sortStage = { $sort: { featured: -1, createdAt: -1 } };
        break;
      default:
        sortStage = { $sort: { createdAt: -1 } };
    }
    pipeline.push(sortStage);

   
     pipeline.push(
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: skip },
            { $limit: pageSize },
            {
              $lookup: {
                from: "types",
                localField: "type",
                foreignField: "_id",
                as: "type"
              }
            },
            { $unwind: { path: "$type", preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: "collections",
                localField: "collection",
                foreignField: "_id",
                as: "collection"
              }
            },
            { $unwind: { path: "$collection", preserveNullAndEmptyArrays: true } }
          ]
        }
      }
    );

    const results = await Product.aggregate(pipeline);
    const products = results[0].data;
    const totalProducts = results[0].metadata[0] ? results[0].metadata[0].total : 0;
    // const products = await Product.find(query)
    //   .populate('type', 'name logo')
    //   .sort(sortOptions)
    //   .limit(pageSize)
    //   .skip(skip)
    //   .lean();

    const count = await Product.countDocuments(query);
    const totalPages = Math.ceil(count / pageSize);

    res.json({
      products,
      totalPages,
      currentPage: pageNumber,
      totalProducts: count,
      hasNextPage: pageNumber < totalPages,
      hasPrevPage: pageNumber > 1
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      message: 'Server error fetching products',
      error: error.message
    });
  }
};


// @desc    Get single product
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('type', 'name logo')
      .populate('collection', 'name slug image')
      .populate('reviews.user', 'name');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a product (Admin only)
// @route   POST /api/products
const createProduct = async (req, res) => {
  try {
    const { newType, ...productData } = req.body;

    if (newType && newType.name) {
      const type = new Type(newType);
      const savedType = await type.save();
      productData.type = savedType._id;
    } else if (productData.type) {
      const typeExists = await Type.findById(productData.type);
      if (!typeExists) {
        return res.status(400).json({ message: 'Selected type does not exist' });
      }
    } else {
      return res.status(400).json({ message: 'Type is required' });
    }

    if (productData.collection) {
      const collectionExists = await Collection.findById(productData.collection);
      if (!collectionExists) {
        return res.status(400).json({ message: 'Selected collection does not exist' });
      }
    } else {
      return res.status(400).json({ message: 'Collection is required' });
    }

    const product = new Product(productData);
    const savedProduct = await product.save();

    await savedProduct.populate('type', 'name logo');
    await savedProduct.populate('collection', 'name slug image');

    res.status(201).json(savedProduct);

  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({
      message: 'Server error creating product',
      error: error.message
    });
  }
};

const getCollectionsWithTypes = async (req, res) => {
  try {
    const collections = await Product.aggregate([
      {
        $lookup: {
          from: 'collections',
          localField: 'collection',
          foreignField: '_id',
          as: 'collectionDetails'
        }
      },
      {
        $lookup: {
          from: 'types',
          localField: 'type',
          foreignField: '_id',
          as: 'typeDetails'
        }
      },
      { $match: {
        'collectionDetails': { $ne: [] },
        'typeDetails': { $ne: [] }
      } },
      { $unwind: '$collectionDetails' },
      { $unwind: '$typeDetails' },
      {
        $group: {
          _id: {
            collectionId: '$collectionDetails._id',
            collectionName: '$collectionDetails.name',
            collectionSlug: '$collectionDetails.slug',
            typeId: '$typeDetails._id',
            typeName: '$typeDetails.name'
          }
        }
      },
      {
        $group: {
          _id: {
            collectionId: '$_id.collectionId',
            collectionName: '$_id.collectionName',
            collectionSlug: '$_id.collectionSlug'
          },
          types: {
            $addToSet: {
              _id: '$_id.typeId',
              name: '$_id.typeName'
            }
          }
        }
      },
      {
        $project: {
          _id: '$_id.collectionId',
          name: '$_id.collectionName',
          slug: '$_id.collectionSlug',
          types: {
            $sortArray: { input: "$types", sortBy: { name: 1 } }
          }
        }
      },
      { $sort: { name: 1 } }
    ]);
    res.json(collections);
  } catch (error) {
    console.error('Error fetching collections with types:', error);
    res.status(500).json({
      message: 'Server error fetching collections',
      error: error.message
    });
  }
};

// @desc    Update a product (Admin only)
// @route   PUT /api/products/:id  
const updateProduct = async (req, res) => {
  try {
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!req.body.images) {
      req.body.images = existingProduct.images;
    }

    if (req.body.images && Array.isArray(req.body.images)) {
      const oldImages = existingProduct.images || [];
      const newImages = req.body.images;

      const imagesToDelete = oldImages.filter(oldImg => !newImages.includes(oldImg));

      for (const imageUrl of imagesToDelete) {
        const s3Key = extractS3KeyFromUrl(imageUrl);
        if (s3Key) {
          await deleteFromS3(s3Key);
        }
      }
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('type', 'name logo').populate('collection', 'name slug image');

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const rateProduct = async (req, res) => {
  try {
    const { rating, comment, orderId, reviewerName, reviewerEmail } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // If a logged-in user is present, attach their user id and optionally mark verified purchase
    if (req.user && req.user._id) {
      // Prevent duplicate reviews by same user
      const existingReview = product.reviews.find(
        review => review.user && review.user.toString() === req.user._id.toString()
      );

      if (existingReview) {
        return res.status(400).json({ message: 'You have already reviewed this product' });
      }

      // Check whether this user has a qualifying purchase to mark as verified
      const hasPurchased = await Order.findOne({
        user: req.user._id,
        'items.product': product._id,
        status: { $in: ['processing', 'shipped', 'delivered'] }
      });

      const review = {
        user: req.user._id,
        reviewerName: req.user.name || undefined,
        reviewerEmail: req.user.email || undefined,
        rating,
        comment: comment ? comment.trim() : '',
        isVerifiedPurchase: !!hasPurchased,
        orderId: hasPurchased ? hasPurchased._id : undefined,
        createdAt: new Date()
      };

      product.reviews.push(review);

    } else {
      // Public anonymous or named review
      const safeName = reviewerName && reviewerName.trim() ? reviewerName.trim() : 'Anonymous';
      const safeEmail = reviewerEmail && reviewerEmail.trim() ? reviewerEmail.trim() : undefined;

      // If email provided, prevent multiple reviews from same email
      if (safeEmail) {
        const existingReviewByEmail = product.reviews.find(
          review => review.reviewerEmail && review.reviewerEmail.toLowerCase() === safeEmail.toLowerCase()
        );
        if (existingReviewByEmail) {
          return res.status(400).json({ message: 'This email has already submitted a review for this product' });
        }
      }

      const review = {
        reviewerName: safeName,
        reviewerEmail: safeEmail,
        rating,
        comment: comment ? comment.trim() : '',
        isVerifiedPurchase: false,
        createdAt: new Date()
      };

      product.reviews.push(review);
    }

    // Recalculate rating and review count
    product.reviewCount = product.reviews.length;
    const avgRating = product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length;
    product.rating = Math.round(avgRating * 10) / 10;

    await product.save();

    // Return updated product with populated reviews
    const updatedProduct = await Product.findById(req.params.id)
      .populate('type', 'name logo')
      .populate('collection', 'name slug image')
      .populate('reviews.user', 'name');

    res.json(updatedProduct);
  } catch (error) {
    console.error('Rate product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a product (Admin only)
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.images && Array.isArray(product.images)) {
      for (const imageUrl of product.images) {
        const s3Key = extractS3KeyFromUrl(imageUrl);
        if (s3Key) {
          await deleteFromS3(s3Key);
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};




// @desc    Get all Types
// @route   GET /api/products/types
const getTypes = async (req, res) => {
  try {
    const types = await Type.find().lean();
    const typesWithId = types.map(type => ({
      ...type,
      id: type._id.toString()
    }));
    res.json(typesWithId);
  } catch (error) {
    console.error('Error fetching types:', error);
    res.status(500).json({ message: 'Server error fetching types', error: error.message });
  }
};

// @desc    Create a type (Admin only)
// @route   POST /api/products/types
const createType = async (req, res) => {
  try {
    const type = new Type(req.body);
    const savedType = await type.save();
    res.status(201).json(savedType);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a type (Admin only)
// @route   PUT /api/products/types/:id
const updateType = async (req, res) => {
  try {
    const existingType = await Type.findById(req.params.id);
    if (!existingType) {
      return res.status(404).json({ message: 'Type not found' });
    }

    if (req.body.logo && existingType.logo && req.body.logo !== existingType.logo) {
      const s3Key = extractS3KeyFromUrl(existingType.logo);
      if (s3Key) {
        await deleteFromS3(s3Key);
      }
    }

    const type = await Type.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json(type);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a type (Admin only)
// @route   DELETE /api/products/types/:id
const deleteType = async (req, res) => {
  try {
    const type = await Type.findById(req.params.id);

    if (!type) {
      return res.status(404).json({ message: 'Type not found' });
    }

    if (type.logo) {
      const s3Key = extractS3KeyFromUrl(type.logo);
      if (s3Key) {
        await deleteFromS3(s3Key);
      }
    }

    await Type.findByIdAndDelete(req.params.id);
    res.json({ message: 'Type removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get best-selling products
// @route   GET /api/products/best-sellers
const getBestSellers = async (req, res) => {
  try {
    const bestSellers = await Product.find({ bestSeller: true })
      .populate('type', 'name logo')
      .sort({ createdAt: -1 })
      .lean();

    res.json(bestSellers);
  } catch (error) {
    console.error('Error fetching best sellers:', error);
    res.status(500).json({ message: 'Server error fetching best sellers', error: error.message });
  }
};

// @desc    Get 4 featured products (with fallbacks)
// @route   GET /api/products/featured
const getFeaturedProducts = async (req, res) => {
  try {
    let products = await Product.find({ featured: true })
      .sort({ createdAt: -1 })
      .limit(4)
      .populate('type', 'name logo')
      .lean();

    if (products.length < 4) {
      const needed = 4 - products.length;
      const existingIds = products.map(p => p._id);
      
      const fallbackProducts = await Product.find({ _id: { $nin: existingIds } })
        .sort({ createdAt: -1 })
        .limit(needed)
        .populate('type', 'name logo')
        .lean();
      
      products = [...products, ...fallbackProducts];
    }
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ message: 'Server error fetching featured products' });
  }
};


// @desc    Get 4 new arrival products (with fallbacks)
// @route   GET /api/products/new-arrivals
const getNewArrivals = async (req, res) => {
  try {
    let products = await Product.find({ newArrival: true })
      .sort({ createdAt: -1 })
      .limit(4)
      .populate('type', 'name logo')
      .lean();

    if (products.length < 4) {
      const needed = 4 - products.length;
      const existingIds = products.map(p => p._id);

      const fallbackProducts = await Product.find({ _id: { $nin: existingIds } })
        .sort({ createdAt: -1 })
        .limit(needed)
        .populate('type', 'name logo')
        .lean();

      products = [...products, ...fallbackProducts];
    }
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    res.status(500).json({ message: 'Server error fetching new arrivals' });
  }
};


module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  rateProduct,
  deleteProduct,
  getTypes,
  createType,
  updateType,
  deleteType,
  getCollectionsWithTypes,
  getBestSellers,
  getFeaturedProducts, 
  getNewArrivals  
};