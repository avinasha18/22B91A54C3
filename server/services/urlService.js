import { nanoid } from 'nanoid';
import { getDB } from '../config/database.js';
import { logInfo, logWarn, logError } from '../../shared/log.js';

export class URLService {
  constructor() {
    this.db = getDB();
    this.urlsCollection = this.db.collection('urls');
  }

  // Generate a unique shortcode
  generateShortcode() {
    return nanoid(8); // 8 characters long
  }

  // Validate URL format
  validateURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Create a short URL
  async createShortURL(longURL, customShortcode = null, expiryMinutes = 30) {
    try {
      // Validate long URL
      if (!this.validateURL(longURL)) {
        logWarn('backend', 'service', `Invalid URL provided: ${longURL}`);
        throw new Error('Invalid URL format');
      }

      const now = new Date();
      const expiryTime = new Date(now.getTime() + expiryMinutes * 60 * 1000);
      
      const shortcode = customShortcode || this.generateShortcode();
      
      // Check if custom shortcode already exists
      if (customShortcode) {
        const existing = await this.urlsCollection.findOne({ shortcode });
        if (existing) {
          logWarn('backend', 'service', `Custom shortcode already exists: ${shortcode}`);
          throw new Error('Custom shortcode already exists');
        }
      }

      const urlData = {
        longURL,
        shortcode,
        createdAt: now,
        expiryTime,
        clicks: 0,
        clickLogs: []
      };

      await this.urlsCollection.insertOne(urlData);
      
      logInfo('backend', 'service', `Short URL created: ${shortcode} -> ${longURL}`);
      
      return {
        shortcode,
        shortURL: `${process.env.BASE_URL || 'http://localhost:5000'}/${shortcode}`,
        longURL,
        createdAt: now,
        expiryTime,
        clicks: 0
      };
    } catch (error) {
      logError('backend', 'service', `Error creating short URL: ${error.message}`);
      throw error;
    }
  }

  // Get URL by shortcode
  async getURLByShortcode(shortcode) {
    try {
      const urlData = await this.urlsCollection.findOne({ shortcode });
      
      if (!urlData) {
        logWarn('backend', 'service', `Shortcode not found: ${shortcode}`);
        return null;
      }

      // Check if URL has expired
      if (new Date() > urlData.expiryTime) {
        logWarn('backend', 'service', `Expired URL accessed: ${shortcode}`);
        return { ...urlData, expired: true };
      }

      logInfo('backend', 'service', `URL retrieved: ${shortcode}`);
      return urlData;
    } catch (error) {
      logError('backend', 'service', `Error retrieving URL: ${error.message}`);
      throw error;
    }
  }

  // Record a click
  async recordClick(shortcode, referrer = 'direct', userAgent = 'Unknown') {
    try {
      const clickData = {
        timestamp: new Date(),
        source: referrer,
        userAgent: userAgent
      };

      await this.urlsCollection.updateOne(
        { shortcode },
        { 
          $inc: { clicks: 1 },
          $push: { clickLogs: clickData }
        }
      );

      logInfo('backend', 'service', `Click recorded for: ${shortcode} from ${referrer}`);
    } catch (error) {
      logError('backend', 'service', `Error recording click: ${error.message}`);
      throw error;
    }
  }

  // Get URL statistics
  async getURLStats(shortcode) {
    try {
      const urlData = await this.urlsCollection.findOne({ shortcode });
      
      if (!urlData) {
        logWarn('backend', 'service', `Stats requested for non-existent shortcode: ${shortcode}`);
        return null;
      }

      logInfo('backend', 'service', `Stats retrieved for: ${shortcode}`);
      
      return {
        shortcode,
        longURL: urlData.longURL,
        shortURL: `${process.env.BASE_URL || 'http://localhost:5000'}/${shortcode}`,
        createdAt: urlData.createdAt,
        expiryTime: urlData.expiryTime,
        clicks: urlData.clicks,
        clickLogs: urlData.clickLogs || [],
        isExpired: new Date() > urlData.expiryTime
      };
    } catch (error) {
      logError('backend', 'service', `Error getting URL stats: ${error.message}`);
      throw error;
    }
  }

  // Get all URLs (for admin/stats page)
  async getAllURLs() {
    try {
      const urls = await this.urlsCollection.find({}).toArray();
      
      logInfo('backend', 'service', `Retrieved ${urls.length} URLs`);
      
      return urls.map(url => ({
        shortcode: url.shortcode,
        longURL: url.longURL,
        shortURL: `${process.env.BASE_URL || 'http://localhost:5000'}/${url.shortcode}`,
        createdAt: url.createdAt,
        expiryTime: url.expiryTime,
        clicks: url.clicks,
        isExpired: new Date() > url.expiryTime
      }));
    } catch (error) {
      logError('backend', 'service', `Error getting all URLs: ${error.message}`);
      throw error;
    }
  }

  // Get statistics for a single URL (by shortcode)
  async getSingleURLStats(shortcode) {
    return this.getURLStats(shortcode);
  }
} 