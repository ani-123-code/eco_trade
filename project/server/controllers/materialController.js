const Material = require('../models/Material');
const Auction = require('../models/Auction');

// @desc    Create material listing
// @route   POST /api/materials
const createMaterial = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      quantity,
      unit,
      images,
      location,
      listingType,
      startingPrice,
      reservePrice,
      auctionEndTime,
      condition,
      specifications,
      isDraft = false,
      scheduledPublishDate,
      tokenAmount = 0,
      // Compliance checkboxes
      sellerConfirmsOwnership,
      materialCompliesWithLaws,
      buyerResponsibleForTransport,
      platformNotLiableForDisputes,
      // Category-specific fields
      ewasteType,
      workingCondition,
      approxYear,
      hazardousComponentsPresent,
      dataCleared,
      weighmentMethod,
      brandList,
      batteryIncluded,
      pcbGrade,
      metalType,
      gradePurity,
      form,
      contaminationPresent,
      oilGreasePresent,
      magnetTestPassed,
      plasticType,
      plasticForm,
      cleanliness,
      color,
      moistureLevel,
      foodGrade,
      paperType,
      paperCondition,
      baledOrLoose,
      paperContaminationPresent,
      approxGSM,
      storageCondition,
      textileType,
      textileForm,
      textileCleanliness,
      reusableOrRecyclingGrade,
      colorSortingAvailable,
      productType,
      expiryDate,
      packagingCondition,
      returnDamageReason,
      batchQuantity,
      brand,
      mrp,
      materialDescription,
      intendedUseNature,
      specialHandlingRequired
    } = req.body;

    // Validate required fields
    if (!name || !category || !quantity || !unit || !location || !listingType) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, quantity, unit, location, and listingType are required'
      });
    }

    // Validate category
    if (!['ewaste', 'fmgc', 'metal', 'plastics', 'paper', 'textile', 'other', 'machines', 'software'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Must be one of: ewaste, fmgc, metal, plastics, paper, textile, other, machines, software'
      });
    }

    // Validate listingType
    if (!['auction', 'rfq'].includes(listingType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid listingType. Must be either "auction" or "rfq"'
      });
    }

    // Check if user is verified seller
    if (req.user.userType !== 'seller' || !req.user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Only verified sellers can create material listings'
      });
    }

    // Validate auction-specific fields
    if (listingType === 'auction') {
      if (!startingPrice || !auctionEndTime) {
        return res.status(400).json({
          success: false,
          message: 'startingPrice and auctionEndTime are required for auction listings'
        });
      }

      if (new Date(auctionEndTime) <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'auctionEndTime must be in the future'
        });
      }
    }

    // Validate compliance checkboxes
    if (!sellerConfirmsOwnership || !materialCompliesWithLaws || !buyerResponsibleForTransport || !platformNotLiableForDisputes) {
      return res.status(400).json({
        success: false,
        message: 'All compliance checkboxes must be accepted'
      });
    }

    // Helper function to only include non-empty values
    const includeIfNotEmpty = (value) => {
      return value !== undefined && value !== null && value !== '' ? value : undefined;
    };

    // Create material with base fields
    const materialData = {
      name,
      description,
      category,
      quantity,
      unit,
      images: images || [],
      location,
      seller: req.user._id,
      listingType,
      startingPrice: listingType === 'auction' ? startingPrice : null,
      reservePrice: listingType === 'auction' ? reservePrice : null,
      auctionEndTime: listingType === 'auction' ? auctionEndTime : null,
      condition: condition || 'good',
      specifications: specifications || {},
      status: 'pending', // Pending admin verification
      // Compliance checkboxes
      sellerConfirmsOwnership: sellerConfirmsOwnership || false,
      materialCompliesWithLaws: materialCompliesWithLaws || false,
      buyerResponsibleForTransport: buyerResponsibleForTransport || false,
      platformNotLiableForDisputes: platformNotLiableForDisputes || false
    };

    // Only include category-specific fields relevant to the selected category
    if (category === 'ewaste') {
      if (includeIfNotEmpty(ewasteType)) materialData.ewasteType = ewasteType;
      if (includeIfNotEmpty(workingCondition)) materialData.workingCondition = workingCondition;
      if (includeIfNotEmpty(approxYear)) materialData.approxYear = approxYear;
      if (includeIfNotEmpty(hazardousComponentsPresent)) materialData.hazardousComponentsPresent = hazardousComponentsPresent;
      if (includeIfNotEmpty(dataCleared)) materialData.dataCleared = dataCleared;
      if (includeIfNotEmpty(weighmentMethod)) materialData.weighmentMethod = weighmentMethod;
      if (includeIfNotEmpty(brandList)) materialData.brandList = brandList;
      if (includeIfNotEmpty(batteryIncluded)) materialData.batteryIncluded = batteryIncluded;
      if (includeIfNotEmpty(pcbGrade)) materialData.pcbGrade = pcbGrade;
    } else if (category === 'metal') {
      if (includeIfNotEmpty(metalType)) materialData.metalType = metalType;
      if (includeIfNotEmpty(gradePurity)) materialData.gradePurity = gradePurity;
      if (includeIfNotEmpty(form)) materialData.form = form;
      if (includeIfNotEmpty(contaminationPresent)) materialData.contaminationPresent = contaminationPresent;
      if (includeIfNotEmpty(weighmentMethod)) materialData.weighmentMethod = weighmentMethod;
      if (includeIfNotEmpty(oilGreasePresent)) materialData.oilGreasePresent = oilGreasePresent;
      if (includeIfNotEmpty(magnetTestPassed)) materialData.magnetTestPassed = magnetTestPassed;
    } else if (category === 'plastics') {
      if (includeIfNotEmpty(plasticType)) materialData.plasticType = plasticType;
      if (includeIfNotEmpty(plasticForm)) materialData.plasticForm = plasticForm;
      if (includeIfNotEmpty(cleanliness)) materialData.cleanliness = cleanliness;
      if (includeIfNotEmpty(color)) materialData.color = color;
      if (includeIfNotEmpty(moistureLevel)) materialData.moistureLevel = moistureLevel;
      if (includeIfNotEmpty(foodGrade)) materialData.foodGrade = foodGrade;
    } else if (category === 'paper') {
      if (includeIfNotEmpty(paperType)) materialData.paperType = paperType;
      if (includeIfNotEmpty(paperCondition)) materialData.paperCondition = paperCondition;
      if (includeIfNotEmpty(baledOrLoose)) materialData.baledOrLoose = baledOrLoose;
      if (includeIfNotEmpty(paperContaminationPresent)) materialData.paperContaminationPresent = paperContaminationPresent;
      if (includeIfNotEmpty(approxGSM)) materialData.approxGSM = approxGSM;
      if (includeIfNotEmpty(storageCondition)) materialData.storageCondition = storageCondition;
    } else if (category === 'textile') {
      if (includeIfNotEmpty(textileType)) materialData.textileType = textileType;
      if (includeIfNotEmpty(textileForm)) materialData.textileForm = textileForm;
      if (includeIfNotEmpty(textileCleanliness)) materialData.textileCleanliness = textileCleanliness;
      if (includeIfNotEmpty(reusableOrRecyclingGrade)) materialData.reusableOrRecyclingGrade = reusableOrRecyclingGrade;
      if (includeIfNotEmpty(colorSortingAvailable)) materialData.colorSortingAvailable = colorSortingAvailable;
    } else if (category === 'fmgc') {
      if (includeIfNotEmpty(productType)) materialData.productType = productType;
      if (expiryDate) materialData.expiryDate = new Date(expiryDate);
      if (includeIfNotEmpty(packagingCondition)) materialData.packagingCondition = packagingCondition;
      if (includeIfNotEmpty(returnDamageReason)) materialData.returnDamageReason = returnDamageReason;
      if (includeIfNotEmpty(batchQuantity)) materialData.batchQuantity = batchQuantity;
      if (includeIfNotEmpty(brand)) materialData.brand = brand;
      if (mrp) materialData.mrp = parseFloat(mrp);
    } else if (category === 'other') {
      if (includeIfNotEmpty(materialDescription)) materialData.materialDescription = materialDescription;
      if (includeIfNotEmpty(intendedUseNature)) materialData.intendedUseNature = intendedUseNature;
      if (includeIfNotEmpty(specialHandlingRequired)) materialData.specialHandlingRequired = specialHandlingRequired;
    }

    const material = await Material.create(materialData);

    // If auction, create auction record
    // ALL seller-created auctions must go through admin approval first
    if (listingType === 'auction') {
      let auctionStatus = 'draft';
      // If scheduled, set status to 'scheduled', otherwise always 'draft' (requires admin approval)
      if (scheduledPublishDate) {
        auctionStatus = 'scheduled';
      } else {
        // Always draft for instant auctions - admin must approve before it goes live
        auctionStatus = 'draft';
      }

      await Auction.create({
        material: material._id,
        startingPrice,
        reservePrice: reservePrice || null,
        endTime: auctionEndTime,
        status: auctionStatus,
        isDraft: true, // Always draft until admin approves
        scheduledPublishDate: scheduledPublishDate || null,
        tokenAmount: tokenAmount || 0,
        adminApproved: false // Not approved yet - will appear in seller requests
      });
    }

    res.status(201).json({
      success: true,
      message: 'Material listing created successfully. Pending admin verification.',
      data: material
    });
  } catch (error) {
    console.error('Create material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create material listing',
      error: error.message
    });
  }
};

// @desc    Get all materials
// @route   GET /api/materials
const getMaterials = async (req, res) => {
  try {
    const {
      category,
      listingType,
      status,
      search,
      page = 1,
      limit = 12,
      sortBy = 'newest'
    } = req.query;

    const query = {};

    // Only show verified materials to non-admin users
    if (req.user?.role !== 'admin') {
      query.isVerified = true;
      query.status = { $in: ['active', 'pending'] };
    } else if (status) {
      query.status = status;
    }

    // Category filter
    if (category) {
      query.category = category;
    } else {
      // Exclude machines and softwares from general materials listing
      // They have their own dedicated pages
      query.category = { $nin: ['machines', 'software'] };
    }

    // Listing type filter
    if (listingType) {
      query.listingType = listingType;
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Sorting
    let sort = {};
    switch (sortBy) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'price-asc':
        sort = { startingPrice: 1 };
        break;
      case 'price-desc':
        sort = { startingPrice: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const materials = await Material.find(query)
      .populate('seller', 'name email phoneNumber')
      .sort(sort)
      .skip(skip)
      .limit(pageSize);

    const total = await Material.countDocuments(query);

    res.json({
      success: true,
      data: materials,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        pages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch materials',
      error: error.message
    });
  }
};

// @desc    Get material by ID
// @route   GET /api/materials/:id
const getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('seller', 'name email phoneNumber city state')
      .populate('verifiedBy', 'name email');

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Check if user can view (verified or admin or seller)
    if (!material.isVerified && req.user?.role !== 'admin' && material.seller._id.toString() !== req.user?._id?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Material is pending verification'
      });
    }

    res.json({
      success: true,
      data: material
    });
  } catch (error) {
    console.error('Get material by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch material',
      error: error.message
    });
  }
};

// @desc    Update material
// @route   PUT /api/materials/:id
const updateMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Check if user is the seller
    if (material.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this material'
      });
    }

    // Update fields
    const {
      name,
      description,
      category,
      quantity,
      unit,
      condition,
      location,
      images,
      startingPrice,
      reservePrice,
      auctionEndTime,
      // Compliance checkboxes
      sellerConfirmsOwnership,
      materialCompliesWithLaws,
      buyerResponsibleForTransport,
      platformNotLiableForDisputes,
      // Category-specific fields
      ewasteType,
      workingCondition,
      approxYear,
      hazardousComponentsPresent,
      dataCleared,
      weighmentMethod,
      brandList,
      batteryIncluded,
      pcbGrade,
      metalType,
      gradePurity,
      form,
      contaminationPresent,
      oilGreasePresent,
      magnetTestPassed,
      plasticType,
      plasticForm,
      cleanliness,
      color,
      moistureLevel,
      foodGrade,
      paperType,
      paperCondition,
      baledOrLoose,
      paperContaminationPresent,
      approxGSM,
      storageCondition,
      textileType,
      textileForm,
      textileCleanliness,
      reusableOrRecyclingGrade,
      colorSortingAvailable,
      productType,
      expiryDate,
      packagingCondition,
      returnDamageReason,
      batchQuantity,
      brand,
      mrp,
      materialDescription,
      intendedUseNature,
      specialHandlingRequired,
      specifications
    } = req.body;

    // Validate compliance checkboxes if provided
    if (sellerConfirmsOwnership !== undefined || materialCompliesWithLaws !== undefined || 
        buyerResponsibleForTransport !== undefined || platformNotLiableForDisputes !== undefined) {
      if (!sellerConfirmsOwnership || !materialCompliesWithLaws || 
          !buyerResponsibleForTransport || !platformNotLiableForDisputes) {
        return res.status(400).json({
          success: false,
          message: 'All compliance checkboxes must be accepted'
        });
      }
    }

    // Helper function to only include non-empty values
    const includeIfNotEmpty = (value) => {
      return value !== undefined && value !== null && value !== '' ? value : undefined;
    };

    // Update basic fields
    if (name) material.name = name;
    if (description !== undefined) material.description = description;
    if (category) material.category = category;
    if (quantity !== undefined) material.quantity = quantity;
    if (unit) material.unit = unit;
    if (images) material.images = images;
    if (location) material.location = location;
    if (startingPrice !== undefined) material.startingPrice = startingPrice;
    if (reservePrice !== undefined) material.reservePrice = reservePrice;
    if (auctionEndTime) material.auctionEndTime = auctionEndTime;
    if (condition) material.condition = condition;
    if (specifications) material.specifications = specifications;
    
    // Update compliance checkboxes
    if (sellerConfirmsOwnership !== undefined) material.sellerConfirmsOwnership = sellerConfirmsOwnership;
    if (materialCompliesWithLaws !== undefined) material.materialCompliesWithLaws = materialCompliesWithLaws;
    if (buyerResponsibleForTransport !== undefined) material.buyerResponsibleForTransport = buyerResponsibleForTransport;
    if (platformNotLiableForDisputes !== undefined) material.platformNotLiableForDisputes = platformNotLiableForDisputes;
    
    // Get the current or new category
    const currentCategory = category || material.category;
    
    // Update category-specific fields (only update if provided and not empty, and relevant to category)
    if (currentCategory === 'ewaste') {
      const ewasteVal = includeIfNotEmpty(ewasteType);
      if (ewasteVal !== undefined) material.ewasteType = ewasteVal;
      const workingVal = includeIfNotEmpty(workingCondition);
      if (workingVal !== undefined) material.workingCondition = workingVal;
      const yearVal = includeIfNotEmpty(approxYear);
      if (yearVal !== undefined) material.approxYear = yearVal;
      const hazardVal = includeIfNotEmpty(hazardousComponentsPresent);
      if (hazardVal !== undefined) material.hazardousComponentsPresent = hazardVal;
      const dataVal = includeIfNotEmpty(dataCleared);
      if (dataVal !== undefined) material.dataCleared = dataVal;
      const weighVal = includeIfNotEmpty(weighmentMethod);
      if (weighVal !== undefined) material.weighmentMethod = weighVal;
      const brandVal = includeIfNotEmpty(brandList);
      if (brandVal !== undefined) material.brandList = brandVal;
      const batteryVal = includeIfNotEmpty(batteryIncluded);
      if (batteryVal !== undefined) material.batteryIncluded = batteryVal;
      const pcbVal = includeIfNotEmpty(pcbGrade);
      if (pcbVal !== undefined) material.pcbGrade = pcbVal;
    } else if (currentCategory === 'metal') {
      const metalVal = includeIfNotEmpty(metalType);
      if (metalVal !== undefined) material.metalType = metalVal;
      const gradeVal = includeIfNotEmpty(gradePurity);
      if (gradeVal !== undefined) material.gradePurity = gradeVal;
      const formVal = includeIfNotEmpty(form);
      if (formVal !== undefined) material.form = formVal;
      const contamVal = includeIfNotEmpty(contaminationPresent);
      if (contamVal !== undefined) material.contaminationPresent = contamVal;
      const weighVal = includeIfNotEmpty(weighmentMethod);
      if (weighVal !== undefined) material.weighmentMethod = weighVal;
      const oilVal = includeIfNotEmpty(oilGreasePresent);
      if (oilVal !== undefined) material.oilGreasePresent = oilVal;
      const magnetVal = includeIfNotEmpty(magnetTestPassed);
      if (magnetVal !== undefined) material.magnetTestPassed = magnetVal;
    } else if (currentCategory === 'plastics') {
      const plasticVal = includeIfNotEmpty(plasticType);
      if (plasticVal !== undefined) material.plasticType = plasticVal;
      const formVal = includeIfNotEmpty(plasticForm);
      if (formVal !== undefined) material.plasticForm = formVal;
      const cleanVal = includeIfNotEmpty(cleanliness);
      if (cleanVal !== undefined) material.cleanliness = cleanVal;
      const colorVal = includeIfNotEmpty(color);
      if (colorVal !== undefined) material.color = colorVal;
      const moistureVal = includeIfNotEmpty(moistureLevel);
      if (moistureVal !== undefined) material.moistureLevel = moistureVal;
      const foodVal = includeIfNotEmpty(foodGrade);
      if (foodVal !== undefined) material.foodGrade = foodVal;
    } else if (currentCategory === 'paper') {
      const paperVal = includeIfNotEmpty(paperType);
      if (paperVal !== undefined) material.paperType = paperVal;
      const condVal = includeIfNotEmpty(paperCondition);
      if (condVal !== undefined) material.paperCondition = condVal;
      const baledVal = includeIfNotEmpty(baledOrLoose);
      if (baledVal !== undefined) material.baledOrLoose = baledVal;
      const contamVal = includeIfNotEmpty(paperContaminationPresent);
      if (contamVal !== undefined) material.paperContaminationPresent = contamVal;
      const gsmVal = includeIfNotEmpty(approxGSM);
      if (gsmVal !== undefined) material.approxGSM = gsmVal;
      const storageVal = includeIfNotEmpty(storageCondition);
      if (storageVal !== undefined) material.storageCondition = storageVal;
    } else if (currentCategory === 'textile') {
      const textileVal = includeIfNotEmpty(textileType);
      if (textileVal !== undefined) material.textileType = textileVal;
      const formVal = includeIfNotEmpty(textileForm);
      if (formVal !== undefined) material.textileForm = formVal;
      const cleanVal = includeIfNotEmpty(textileCleanliness);
      if (cleanVal !== undefined) material.textileCleanliness = cleanVal;
      const reuseVal = includeIfNotEmpty(reusableOrRecyclingGrade);
      if (reuseVal !== undefined) material.reusableOrRecyclingGrade = reuseVal;
      const colorVal = includeIfNotEmpty(colorSortingAvailable);
      if (colorVal !== undefined) material.colorSortingAvailable = colorVal;
    } else if (currentCategory === 'fmgc') {
      const productVal = includeIfNotEmpty(productType);
      if (productVal !== undefined) material.productType = productVal;
      if (expiryDate !== undefined) material.expiryDate = expiryDate ? new Date(expiryDate) : null;
      const packVal = includeIfNotEmpty(packagingCondition);
      if (packVal !== undefined) material.packagingCondition = packVal;
      const returnVal = includeIfNotEmpty(returnDamageReason);
      if (returnVal !== undefined) material.returnDamageReason = returnVal;
      const batchVal = includeIfNotEmpty(batchQuantity);
      if (batchVal !== undefined) material.batchQuantity = batchVal;
      const brandVal = includeIfNotEmpty(brand);
      if (brandVal !== undefined) material.brand = brandVal;
      if (mrp !== undefined) material.mrp = mrp ? parseFloat(mrp) : null;
    } else if (currentCategory === 'other') {
      const descVal = includeIfNotEmpty(materialDescription);
      if (descVal !== undefined) material.materialDescription = descVal;
      const useVal = includeIfNotEmpty(intendedUseNature);
      if (useVal !== undefined) material.intendedUseNature = useVal;
      const handlingVal = includeIfNotEmpty(specialHandlingRequired);
      if (handlingVal !== undefined) material.specialHandlingRequired = handlingVal;
    }

    await material.save();

    res.json({
      success: true,
      message: 'Material updated successfully',
      data: material
    });
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update material',
      error: error.message
    });
  }
};

// @desc    Delete material
// @route   DELETE /api/materials/:id
const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Check if user is the seller or admin
    if (material.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this material'
      });
    }

    // Delete associated auction if exists
    const Auction = require('../models/Auction');
    const Bid = require('../models/Bid');
    const RFQ = require('../models/RFQ');
    
    const auction = await Auction.findOne({ material: material._id });
    if (auction) {
      await Bid.deleteMany({ auction: auction._id });
      await Auction.findByIdAndDelete(auction._id);
    }

    // Delete associated RFQs
    await RFQ.deleteMany({ material: material._id });

    await Material.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Material deleted successfully'
    });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete material',
      error: error.message
    });
  }
};

// @desc    Admin verify material
// @route   PUT /api/materials/:id/verify
const verifyMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Only admin can verify
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can verify materials'
      });
    }

    material.isVerified = true;
    material.verifiedBy = req.user._id;
    material.verifiedAt = new Date();
    material.status = 'active';

    await material.save();

    // If auction type, ensure auction exists and is active
    if (material.listingType === 'auction') {
      let auction = await Auction.findOne({ material: material._id });
      
      if (!auction) {
        // Create auction if it doesn't exist
        auction = await Auction.create({
          material: material._id,
          startingPrice: material.startingPrice,
          reservePrice: material.reservePrice || null,
          endTime: material.auctionEndTime,
          status: 'active',
          currentBid: material.startingPrice || 0
        });
      } else {
        // Activate auction if it exists but was inactive
        auction.status = 'active';
        await auction.save();
      }
    }

    res.json({
      success: true,
      message: 'Material verified successfully',
      data: material
    });
  } catch (error) {
    console.error('Verify material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify material',
      error: error.message
    });
  }
};

// @desc    Get seller's materials
// @route   GET /api/materials/seller
const getSellerMaterials = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user is a seller
    if (req.user.userType !== 'seller') {
      return res.status(403).json({
        success: false,
        message: 'Only sellers can access this endpoint'
      });
    }

    const materials = await Material.find({ seller: req.user._id })
      .populate('seller', 'name email')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: materials
    });
  } catch (error) {
    console.error('Get seller materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seller materials',
      error: error.message
    });
  }
};

module.exports = {
  createMaterial,
  getMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
  verifyMaterial,
  getSellerMaterials
};

