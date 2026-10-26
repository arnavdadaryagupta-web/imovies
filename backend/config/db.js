const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies';
    console.log(`[Database] Attempting connection to MongoDB at: ${mongoUri.replace(/:[^:]*@/, ':****@')}`);
    
    // Set connection timeout so server doesn't hang if local mongod is absent
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });

    isConnected = true;
    console.log(`[Database] MongoDB Connected Successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`\n[Database Warning] Could not connect to MongoDB: ${error.message}`);
    console.warn(`[Database Notice] Active Fallback Mode: IMovies will use local structured JSON storage for seamless operation without local MongoDB running.`);
    console.warn(`[Database Tip] To connect to real MongoDB, start your local MongoDB service ('mongod') or set MONGODB_URI in backend/.env to your MongoDB Atlas connection string.\n`);
    isConnected = false;
    return false;
  }
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, getIsConnected };
