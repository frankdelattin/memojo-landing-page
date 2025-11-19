require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'db.json');
const JWT_SECRET = process.env.JWT_SECRET || 'memojo_development_jwt_secret';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'memojo2025admin';

// Middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? 'https://yourproductiondomain.com'
    : ['http://localhost:8000', 'http://127.0.0.1:8000'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions)); // Enable CORS with specific options
app.use(helmet()); // Add security headers
app.use(express.json()); // To parse JSON request bodies
app.use(cookieParser(process.env.COOKIE_SECRET || 'memojo_development_cookie_secret'));
app.use(session({
  secret: process.env.COOKIE_SECRET || 'memojo_development_cookie_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 3600000 // 1 hour
  }
}));

// Helper function to read data from db.json
const readDb = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    // If file doesn't exist or is corrupted, return a default structure
    return { votes: {}, subscriptions: {} };
  }
};

// Helper function to write data to db.json
const writeDb = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to database:', error);
  }
};

// Authentication middleware
const authenticateJWT = (req, res, next) => {
  console.log('🔒 Auth check for:', req.path);

  // Check for token in cookies or Authorization header
  // Also check for adminToken to be compatible with frontend implementation
  const token = req.cookies.token || req.cookies.adminToken || req.headers.authorization?.split(' ')[1];
  console.log('🔍 Token found in request:', !!token);

  if (!token) {
    console.log('❌ No token found, authentication required');
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token verified successfully for user:', user.username);
    req.user = user;
    next();
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// --- API Endpoints ---

// Endpoint to record a vote
app.post('/api/vote', (req, res) => {
  const { featureId, voteType } = req.body; // e.g., feature-share, high

  if (!featureId || !voteType) {
    return res.status(400).json({ message: 'Missing featureId or voteType' });
  }

  const db = readDb();

  if (!db.votes[featureId]) {
    db.votes[featureId] = { low: 0, medium: 0, high: 0 };
  }
  if (db.votes[featureId][voteType] !== undefined) {
    db.votes[featureId][voteType]++;
  } else {
    return res.status(400).json({ message: 'Invalid voteType' });
  }

  writeDb(db);
  res.status(200).json({ message: 'Vote recorded', votes: db.votes[featureId] });
});

// Endpoint to record an email subscription
app.post('/api/subscribe', (req, res) => {
  const { email, featureId, platform } = req.body; // featureId for poll signups, platform for beta forms

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  if (!featureId && !platform) {
    return res.status(400).json({ message: 'Either featureId or platform is required for subscription' });
  }

  const db = readDb();
  let subscriptionKey = '';

  if (featureId) {
    subscriptionKey = featureId; // e.g., feature-share
    if (!db.subscriptions[subscriptionKey]) {
      db.subscriptions[subscriptionKey] = [];
    }
  } else if (platform) {
    subscriptionKey = `platform-${platform.toLowerCase()}`; // e.g., platform-android
    if (!db.subscriptions[subscriptionKey]) {
      db.subscriptions[subscriptionKey] = [];
    }
  }

  if (db.subscriptions[subscriptionKey] && !db.subscriptions[subscriptionKey].includes(email)) {
    db.subscriptions[subscriptionKey].push(email);
  } else if (db.subscriptions[subscriptionKey] && db.subscriptions[subscriptionKey].includes(email)) {
    return res.status(200).json({ message: 'Email already subscribed for this feature/platform.' });
  }


  writeDb(db);
  res.status(200).json({ message: 'Subscription successful' });
});

// Basic GET endpoint to check if server is running
app.get('/api/status', (req, res) => {
  res.status(200).json({ message: 'Backend server is running!' });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Login attempt received:', { username: req.body.username });

  const { username, password } = req.body;

  // Validate credentials
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    console.log('❌ Login failed: Invalid credentials');
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  console.log('✅ Credentials validated successfully');

  // Create JWT token
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  console.log('🔑 JWT token created');

  // Set tokens as HTTP-only cookies (both names for compatibility)
  // Standard name used by backend
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600000 // 1 hour
  });
  // Name expected by frontend
  res.cookie('adminToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600000 // 1 hour
  });
  console.log('🍪 Cookies set with token');

  res.status(200).json({ message: 'Authentication successful', token });
  console.log('📤 Login response sent with token');
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.clearCookie('adminToken');
  res.status(200).json({ message: 'Logout successful' });
});

// Check authentication status
app.get('/api/auth/status', authenticateJWT, (req, res) => {
  console.log('🔓 User authenticated successfully:', req.user.username);
  res.status(200).json({ authenticated: true, username: req.user.username });
});

// Endpoint to get the entire database content for admin dashboard (protected)
app.get('/api/db', authenticateJWT, (req, res) => {
  const db = readDb();
  res.status(200).json(db);
});

// Security best practices
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Serve static files from root directory
app.use(express.static(path.join(__dirname, '..')));

// Open privacy modal
app.get('/privacy', (req, res, next) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve admin files
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));

// Route for admin pages
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin', 'index.html'));
});

app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin', 'dashboard.html'));
});

// Explicitly handle dashboard.html route as well
app.get('/admin/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin', 'dashboard.html'));
});

app.listen(PORT, () => {
  console.log(`Memojo backend server listening on port ${PORT}`);
  // Ensure db.json exists with default structure if it's empty or new
  const db = readDb();
  if (Object.keys(db.votes).length === 0 && Object.keys(db.subscriptions).length === 0) {
    const defaultDb = {
      votes: {
        "feature-find": { "low": 0, "medium": 0, "high": 0 },
        "feature-share": { "low": 0, "medium": 0, "high": 0 },
        "feature-diary": { "low": 0, "medium": 0, "high": 0 }
      },
      subscriptions: {
        "feature-find": [],
        "feature-share": [],
        "feature-diary": [],
        "platform-android": [],
        "platform-ios": []
      }
    };
    writeDb(defaultDb);
    console.log('Initialized db.json with default structure.');
  }
});
