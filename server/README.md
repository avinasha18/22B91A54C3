# URL Shortener Backend

A Node.js/Express backend service for URL shortening with MongoDB persistence and centralized logging.

## Features

- ✅ Create short URLs with optional custom shortcodes
- ✅ Default 30-minute expiry (configurable)
- ✅ Click tracking and analytics
- ✅ MongoDB persistence with automatic expiry
- ✅ Centralized logging middleware
- ✅ RESTful API endpoints
- ✅ Error handling and validation

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Access token for logging service

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (create `.env` file):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017
BASE_URL=http://localhost:5000
LOG_ACCESS_TOKEN=your_access_token_here
```

3. Start MongoDB (if running locally):
```bash
mongod
```

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### 1. Create Short URL
**POST** `/shorturls`

**Request Body:**
```json
{
  "longURL": "https://example.com/very-long-url",
  "shortcode": "custom123", // optional
  "expiry": 60 // optional, in minutes (default: 30)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shortcode": "abc12345",
    "shortURL": "http://localhost:5000/abc12345",
    "longURL": "https://example.com/very-long-url",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "expiryTime": "2024-01-01T12:30:00.000Z",
    "clicks": 0
  }
}
```

### 2. Get URL Statistics
**GET** `/shorturls/:shortcode`

**Response:**
```json
{
  "success": true,
  "data": {
    "shortcode": "abc12345",
    "longURL": "https://example.com/very-long-url",
    "shortURL": "http://localhost:5000/abc12345",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "expiryTime": "2024-01-01T12:30:00.000Z",
    "clicks": 5,
    "clickLogs": [
      {
        "timestamp": "2024-01-01T12:05:00.000Z",
        "source": "direct"
      }
    ],
    "isExpired": false
  }
}
```

### 3. Redirect to Original URL
**GET** `/:shortcode`

Redirects to the original URL and records a click.

### 4. Get All URLs
**GET** `/shorturls`

Returns all created URLs for the stats page.

### 5. Health Check
**GET** `/health`

Returns server status.

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message"
}
```

Common HTTP status codes:
- `400` - Bad Request (invalid input)
- `404` - Not Found (shortcode doesn't exist)
- `409` - Conflict (custom shortcode already exists)
- `410` - Gone (URL has expired)
- `500` - Internal Server Error

## Logging

The service uses centralized logging middleware that sends logs to the evaluation service. All important events are logged with appropriate levels:

- `debug` - Detailed debugging information
- `info` - General information
- `warn` - Warning messages
- `error` - Error conditions
- `fatal` - Critical errors

## Database Schema

### URLs Collection
```javascript
{
  _id: ObjectId,
  longURL: String,
  shortcode: String (unique),
  createdAt: Date,
  expiryTime: Date,
  clicks: Number,
  clickLogs: Array
}
```

## Project Structure

```
server/
├── config/
│   ├── database.js    # MongoDB connection
│   └── config.js      # Environment configuration
├── controllers/
│   └── urlController.js # Request handlers
├── routes/
│   └── urlRoutes.js   # API routes
├── services/
│   └── urlService.js  # Business logic
├── server.js          # Main server file
└── package.json
```

## Testing

Test the API endpoints using curl or Postman:

```bash
# Create a short URL
curl -X POST http://localhost:5000/shorturls \
  -H "Content-Type: application/json" \
  -d '{"longURL": "https://google.com"}'

# Get stats
curl http://localhost:5000/shorturls/abc12345

# Redirect (will redirect to original URL)
curl -L http://localhost:5000/abc12345
``` 