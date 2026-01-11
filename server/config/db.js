const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    let mongoURI = process.env.MONGODB_URI;
    
    // Ensure database name is ecotrade_db
    if (mongoURI) {
      // Remove existing database name from URI if present
      const uriParts = mongoURI.split('/');
      const baseURI = uriParts.slice(0, -1).join('/');
      mongoURI = `${baseURI}/ecotrade_db`;
    } else {
      // Default connection string if MONGODB_URI is not set
      mongoURI = 'mongodb://localhost:27017/ecotrade_db';
    }
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };
    
    await mongoose.connect(mongoURI, options);
    console.log('MongoDB Connected to ecotrade_db');
  } catch (err) {
    console.error('DB connection error:', err.message);
    console.error('Please check:');
    console.error('1. MongoDB connection string in .env file (MONGODB_URI)');
    console.error('2. Network connectivity');
    console.error('3. MongoDB Atlas cluster status (if using Atlas)');
    console.error('4. IP whitelist in MongoDB Atlas (if using Atlas) - add 0.0.0.0/0 for all IPs');
    console.error('5. MongoDB credentials are correct');
    // Re-throw error so caller can handle it
    throw err;
  }
};

module.exports = connectDB;
