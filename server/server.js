import express from 'express';
import cors from 'cors';
import { connectDB, closeDB } from './config/database.js';
import urlRoutes from './routes/urlRoutes.js';
import { logInfo, logError, logFatal } from '../shared/log.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logInfo('backend', 'middleware', `${req.method} ${req.url} - ${req.ip}`);
  next();
});

// Routes
app.use('/', urlRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  logInfo('backend', 'handler', 'Health check requested');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'URL Shortener API'
  });
});

// 404 handler
app.use('*', (req, res) => {
  logError('backend', 'handler', `Route not found: ${req.originalUrl}`);
  res.status(404).json({
    error: 'Route not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  logFatal('backend', 'middleware', `Unhandled error: ${error.message}`);
  console.error('Unhandled error:', error);
  
  res.status(500).json({
    error: 'Internal server error'
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logInfo('backend', 'middleware', 'Server shutting down gracefully');
  await closeDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logInfo('backend', 'middleware', 'Server shutting down gracefully');
  await closeDB();
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start listening
    app.listen(PORT, () => {
      logInfo('backend', 'middleware', `Server running on port ${PORT}`);
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logFatal('backend', 'middleware', `Failed to start server: ${error.message}`);
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
