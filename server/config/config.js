// Configuration file for environment variables and settings
export const config = {
  // Server configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  DB_NAME: 'url_shortener',
  
  // Base URL for generating short URLs
  BASE_URL: process.env.BASE_URL || 'http://localhost:5000',
  
  // Logging configuration
  LOG_ACCESS_TOKEN: process.env.LOG_ACCESS_TOKEN || '<access_token>',
  
  // Default URL expiry time (in minutes)
  DEFAULT_EXPIRY_MINUTES: 30,
  
  // Shortcode length
  SHORTCODE_LENGTH: 8
}; 