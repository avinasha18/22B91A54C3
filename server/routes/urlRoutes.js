import express from 'express';
import { URLController } from '../controllers/urlController.js';
import { logInfo } from '../../shared/log.js';

const router = express.Router();

// Middleware to log route access
router.use((req, res, next) => {
  logInfo('backend', 'route', `${req.method} ${req.path}`);
  next();
});

// POST /shorturls - Create a short URL
router.post('/shorturls', URLController.createShortURL);

// GET /shorturls/:shortcode - Get URL statistics
router.get('/shorturls/:shortcode', URLController.getURLStats);

// GET /shorturls - Get all URLs (for stats page)
router.get('/shorturls', URLController.getAllURLs);

// GET /:shortcode - Redirect to original URL
router.get('/:shortcode', URLController.redirectToOriginal);

// GET /shorturls/:shortcode/stats - Get stats for a single URL
router.get('/shorturls/:shortcode/stats', URLController.getSingleURLStats);

export default router; 