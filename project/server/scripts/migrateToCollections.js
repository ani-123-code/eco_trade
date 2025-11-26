require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Collection = require('../models/Collection');

const HARDCODED_COLLECTIONS = [
  { name: 'Smartphones', image: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg', parentCategory: 'More Electronics' },
  { name: 'Laptops', image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg', parentCategory: 'More Electronics' },
  { name: 'Tablets', image: 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg', parentCategory: 'More Electronics' },
  { name: 'Cameras', image: 'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg', parentCategory: 'More Electronics' },
  { name: 'Smartwatches', image: 'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg', parentCategory: 'More Electronics' },
  { name: 'Headphones', image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg', parentCategory: 'More Electronics' },
  { name: 'Gaming Consoles', image: 'https://images.pexels.com/photos/371924/pexels-photo-371924.jpeg', parentCategory: 'More Electronics' },
  { name: 'Home Appliances', image: 'https://images.pexels.com/photos/4112236/pexels-photo-4112236.jpeg', parentCategory: 'More Electronics' },
  { name: 'Computer Accessories', image: 'https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg', parentCategory: 'More Electronics' }
];

const migrateToCollections = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('\nStep 1: Creating collection documents...');
    const collectionMap = {};

    for (const collectionData of HARDCODED_COLLECTIONS) {
      const existingCollection = await Collection.findOne({ name: collectionData.name });

      if (existingCollection) {
        console.log(`✓ Collection "${collectionData.name}" already exists`);
        collectionMap[collectionData.name] = existingCollection._id;
      } else {
        const newCollection = new Collection(collectionData);
        await newCollection.save();
        console.log(`✓ Created collection "${collectionData.name}"`);
        collectionMap[collectionData.name] = newCollection._id;
      }
    }

    console.log('\nStep 2: Finding products with old collection format...');
    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        if (typeof product.collection === 'string') {
          const collectionId = collectionMap[product.collection];

          if (collectionId) {
            await Product.updateOne(
              { _id: product._id },
              { $set: { collection: collectionId } }
            );
            console.log(`✓ Migrated product "${product.name}" (${product.collection} → ObjectId)`);
            migratedCount++;
          } else {
            console.log(`⚠ Warning: No matching collection found for "${product.collection}" in product "${product.name}"`);
            const defaultCollection = collectionMap['Computer Accessories'];
            if (defaultCollection) {
              await Product.updateOne(
                { _id: product._id },
                { $set: { collection: defaultCollection } }
              );
              console.log(`  → Assigned to default collection "Computer Accessories"`);
              migratedCount++;
            }
          }
        } else if (mongoose.Types.ObjectId.isValid(product.collection)) {
          console.log(`- Product "${product.name}" already uses ObjectId format`);
          skippedCount++;
        }
      } catch (error) {
        console.error(`✗ Error migrating product "${product.name}":`, error.message);
        errorCount++;
      }
    }

    console.log('\n========================================');
    console.log('Migration Summary:');
    console.log(`Total Products: ${products.length}`);
    console.log(`✓ Migrated: ${migratedCount}`);
    console.log(`- Already Migrated: ${skippedCount}`);
    console.log(`✗ Errors: ${errorCount}`);
    console.log('========================================\n');

    if (migratedCount > 0) {
      console.log('Verifying migration...');
      const productsWithStringCollection = await Product.find({
        collection: { $type: 'string' }
      });

      if (productsWithStringCollection.length === 0) {
        console.log('✓ Migration verification successful! All products use ObjectId for collections.');
      } else {
        console.log(`⚠ Warning: ${productsWithStringCollection.length} products still use string format for collection`);
      }
    }

    console.log('\nMigration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateToCollections();
