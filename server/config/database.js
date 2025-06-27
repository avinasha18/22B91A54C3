import { MongoClient } from 'mongodb';
import { logInfo, logError } from '../../shared/log.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'url_shortener';

let client;
let db;

export const connectDB = async () => {
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    
    // Create indexes for better performance
    await db.collection('urls').createIndex({ shortcode: 1 }, { unique: true });
    await db.collection('urls').createIndex({ expiryTime: 1 }, { expireAfterSeconds: 0 });
    
    logInfo('backend', 'db', 'MongoDB connected');
    console.log('MongoDB connected successfully');
  } catch (error) {
    logError('backend', 'db', `MongoDB connection failed: ${error.message}`);
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db;
};

export const closeDB = async () => {
  if (client) {
    await client.close();
    logInfo('backend', 'db', 'MongoDB connection closed');
  }
}; 