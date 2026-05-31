import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;
let dbMode = 'MongoDB';

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rapvault';
  
  console.log(`Connecting to database at ${mongoURI}...`);
  
  try {
    // Attempt Mongoose connection with a 3-second timeout
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000
    });
    
    isConnected = true;
    dbMode = 'MongoDB';
    console.log('>>> MongoDB Connected Successfully! <<<');
  } catch (error) {
    isConnected = false;
    dbMode = 'Local JSON File';
    console.warn('\n======================================================');
    console.warn('WARNING: Failed to connect to MongoDB Server!');
    console.warn(`Error details: ${error.message}`);
    console.warn('FALLBACK ACTIVATED: Operating in "Local JSON File" mode.');
    console.warn('Data will be safely persisted to backend/data/db.json');
    console.warn('======================================================\n');
  }
};

export const getDbStatus = () => {
  return {
    isConnected,
    dbMode,
    fallback: !isConnected
  };
};
