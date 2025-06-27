import { URLService } from '../services/urlService.js';
import { logInfo, logError, logWarn } from '../../shared/log.js';

export class URLController {
  // Create short URL
  static async createShortURL(req, res) {
    try {
      console.log('API Request: POST /shorturls', req.body);
      const urlService = new URLService();
      const { longURL, shortcode, expiry } = req.body;

      // Validate required fields
      if (!longURL) {
        logError('backend', 'handler', 'Missing longURL in request body');
        console.log('API Response: 400', { error: 'longURL is required' });
        return res.status(400).json({
          error: 'longURL is required'
        });
      }

      // Parse expiry time (default 30 minutes)
      let expiryMinutes = 30;
      if (expiry) {
        expiryMinutes = parseInt(expiry);
        if (isNaN(expiryMinutes) || expiryMinutes <= 0) {
          logError('backend', 'handler', 'Invalid expiry time provided');
          console.log('API Response: 400', { error: 'expiry must be a positive number' });
          return res.status(400).json({
            error: 'expiry must be a positive number'
          });
        }
      }

      const result = await urlService.createShortURL(longURL, shortcode, expiryMinutes);
      
      logInfo('backend', 'handler', `Short URL created successfully: ${result.shortcode}`);
      console.log('API Response: 201', { success: true, data: result });
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      logError('backend', 'handler', `Error creating short URL: ${error.message}`);
      console.log('API Response: 500', { error: error.message });
      if (error.message === 'Invalid URL format') {
        return res.status(400).json({
          error: 'Invalid URL format'
        });
      }
      
      if (error.message === 'Custom shortcode already exists') {
        return res.status(409).json({
          error: 'Custom shortcode already exists'
        });
      }
      
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  // Get URL statistics
  static async getURLStats(req, res) {
    try {
      console.log('API Request: GET /shorturls/:shortcode', req.params);
      const urlService = new URLService();
      const { shortcode } = req.params;

      if (!shortcode) {
        logError('backend', 'handler', 'Missing shortcode parameter');
        console.log('API Response: 400', { error: 'Shortcode is required' });
        return res.status(400).json({
          error: 'Shortcode is required'
        });
      }

      const stats = await urlService.getURLStats(shortcode);
      
      if (!stats) {
        logError('backend', 'handler', `Shortcode not found: ${shortcode}`);
        console.log('API Response: 404', { error: 'Shortcode not found' });
        return res.status(404).json({
          error: 'Shortcode not found'
        });
      }

      logInfo('backend', 'handler', `URL stats retrieved: ${shortcode}`);
      console.log('API Response: 200', { success: true, data: stats });
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logError('backend', 'handler', `Error getting URL stats: ${error.message}`);
      console.log('API Response: 500', { error: error.message });
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  // Redirect to original URL
  static async redirectToOriginal(req, res) {
    try {
      console.log('API Request: GET /:shortcode', req.params);
      const urlService = new URLService();
      const { shortcode } = req.params;

      if (!shortcode) {
        logError('backend', 'handler', 'Missing shortcode parameter');
        console.log('API Response: 400', { error: 'Shortcode is required' });
        return res.status(400).json({
          error: 'Shortcode is required'
        });
      }

      const urlData = await urlService.getURLByShortcode(shortcode);
      
      if (!urlData) {
        logError('backend', 'handler', `Shortcode not found: ${shortcode}`);
        console.log('API Response: 404', { error: 'Shortcode not found' });
        return res.status(404).json({
          error: 'Shortcode not found'
        });
      }

      if (urlData.expired) {
        logWarn('backend', 'handler', `Expired URL accessed: ${shortcode}`);
        console.log('API Response: 410', { error: 'URL has expired' });
        return res.status(410).json({
          error: 'URL has expired'
        });
      }

      // Capture real referrer and user agent
      const referrer = req.get('Referer') || req.get('referer') || 'direct';
      const userAgent = req.get('User-Agent') || 'Unknown';
      
      // Record the click with real data
      await urlService.recordClick(shortcode, referrer, userAgent);
      
      logInfo('backend', 'handler', `Redirecting to: ${urlData.longURL}`);
      console.log('API Response: 302', { location: urlData.longURL });
      res.redirect(urlData.longURL);
    } catch (error) {
      logError('backend', 'handler', `Error redirecting: ${error.message}`);
      console.log('API Response: 500', { error: error.message });
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  // Get all URLs (for admin/stats page)
  static async getAllURLs(req, res) {
    try {
      console.log('API Request: GET /shorturls');
      const urlService = new URLService();
      const urls = await urlService.getAllURLs();
      
      logInfo('backend', 'handler', `All URLs retrieved: ${urls.length} URLs`);
      console.log('API Response: 200', { success: true, data: urls });
      res.json({
        success: true,
        data: urls
      });
    } catch (error) {
      logError('backend', 'handler', `Error getting all URLs: ${error.message}`);
      console.log('API Response: 500', { error: error.message });
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  // Get statistics for a single URL (by shortcode)
  static async getSingleURLStats(req, res) {
    try {
      console.log('API Request: GET /shorturls/:shortcode/stats', req.params);
      const urlService = new URLService();
      const { shortcode } = req.params;

      if (!shortcode) {
        logError('backend', 'handler', 'Missing shortcode parameter');
        console.log('API Response: 400', { error: 'Shortcode is required' });
        return res.status(400).json({
          error: 'Shortcode is required'
        });
      }

      const stats = await urlService.getSingleURLStats(shortcode);
      
      if (!stats) {
        logError('backend', 'handler', `Shortcode not found: ${shortcode}`);
        console.log('API Response: 404', { error: 'Shortcode not found' });
        return res.status(404).json({
          error: 'Shortcode not found'
        });
      }

      logInfo('backend', 'handler', `Single URL stats retrieved: ${shortcode}`);
      console.log('API Response: 200', { success: true, data: stats });
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logError('backend', 'handler', `Error getting single URL stats: ${error.message}`);
      console.log('API Response: 500', { error: error.message });
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
} 