const mongoose = require('mongoose');
require('dotenv').config();

const dropSlugIndex = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('products');

    // Check if slug index exists
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(idx => idx.name));

    const slugIndexExists = indexes.some(idx => idx.name === 'slug_1');
    
    if (slugIndexExists) {
      console.log('Dropping slug_1 index...');
      await collection.dropIndex('slug_1');
      console.log('Successfully dropped slug_1 index');
    } else {
      console.log('slug_1 index does not exist');
    }

    // List remaining indexes
    const remainingIndexes = await collection.indexes();
    console.log('Remaining indexes:', remainingIndexes.map(idx => idx.name));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

dropSlugIndex();