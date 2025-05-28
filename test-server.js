// Simple Express server for testing the admin functionality
const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8000;
const JWT_SECRET = 'memojo_test_secret_key';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'memojo2025admin';

// Mock database
const mockDb = {
  votes: {
    "feature-find": { "low": 5, "medium": 12, "high": 25 },
    "feature-share": { "low": 3, "medium": 18, "high": 14 },
    "feature-diary": { "low": 7, "medium": 9, "high": 11 }
  },
  subscriptions: {
    "feature-find": ["user1@example.com", "user2@example.com"],
    "feature-share": ["user3@example.com", "user4@example.com"],
    "feature-diary": ["user5@example.com"],
    "platform-android": ["android1@example.com", "android2@example.com"],
    "platform-ios": ["ios1@example.com", "ios2@example.com", "ios3@example.com"]
  }
};

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname)));

// Authentication middleware
const authenticateJWT = (req, res, next) => {
  console.log('🔒 Auth check for:', req.path);
  
  // Check for token in cookies
  const token = req.cookies.token || req.cookies.adminToken;
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

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Login attempt received:', req.body);
  
  const { username, password } = req.body;
  
  // Validate credentials
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    console.log('❌ Login failed: Invalid credentials');
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  console.log('✅ Credentials validated successfully');
  
  // Create JWT token
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  
  // Set token as HTTP-only cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: false, // for testing
    maxAge: 3600000 // 1 hour
  });
  
  // Also set adminToken for compatibility
  res.cookie('adminToken', token, {
    httpOnly: true,
    secure: false, // for testing
    maxAge: 3600000 // 1 hour
  });
  
  res.status(200).json({ message: 'Authentication successful', token });
  console.log('📤 Login response sent with token');
});

// Check authentication status
app.get('/api/auth/status', authenticateJWT, (req, res) => {
  console.log('🔓 User authenticated successfully:', req.user.username);
  res.status(200).json({ authenticated: true, username: req.user.username });
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.clearCookie('adminToken');
  res.status(200).json({ message: 'Logout successful' });
});

// Get database content (protected)
app.get('/api/db', authenticateJWT, (req, res) => {
  res.status(200).json(mockDb);
});

// Basic GET endpoint to check if server is running
app.get('/api/status', (req, res) => {
  res.status(200).json({ message: 'Test server is running!' });
});

// Routes for admin pages
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

app.get('/admin/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  console.log(`Admin page available at http://localhost:${PORT}/admin`);
});
