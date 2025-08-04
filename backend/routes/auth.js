const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// In-memory user storage (in production, use a database)
const users = new Map();
const sessions = new Map();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'mental-health-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, employeeId } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    if (users.has(email)) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = uuidv4();
    const user = {
      id: userId,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      employeeId: employeeId || null,
      createdAt: new Date().toISOString(),
      lastLogin: null
    };

    users.set(email, user);

    // Generate JWT token
    const token = jwt.sign(
      { userId, email, firstName, lastName },
      process.env.JWT_SECRET || 'mental-health-secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        email,
        firstName,
        lastName,
        employeeId
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    const user = users.get(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date().toISOString();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
      process.env.JWT_SECRET || 'mental-health-secret',
      { expiresIn: '24h' }
    );

    // Create session
    const sessionId = uuidv4();
    sessions.set(sessionId, {
      userId: user.id,
      email: user.email,
      startTime: new Date().toISOString()
    });

    res.json({
      message: 'Login successful',
      token,
      sessionId,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        employeeId: user.employeeId
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const user = users.get(req.user.email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        employeeId: user.employeeId,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout user
router.post('/logout', authenticateToken, (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (sessionId && sessions.has(sessionId)) {
      sessions.delete(sessionId);
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify token endpoint
router.get('/verify', authenticateToken, (req, res) => {
  res.json({ 
    valid: true, 
    user: {
      userId: req.user.userId,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName
    }
  });
});

// Guest login (for demo purposes)
router.post('/guest', (req, res) => {
  try {
    const guestId = uuidv4();
    const sessionId = uuidv4();

    // Create guest session
    sessions.set(sessionId, {
      userId: guestId,
      email: 'guest@demo.com',
      startTime: new Date().toISOString(),
      isGuest: true
    });

    const token = jwt.sign(
      { userId: guestId, email: 'guest@demo.com', firstName: 'Guest', lastName: 'User', isGuest: true },
      process.env.JWT_SECRET || 'mental-health-secret',
      { expiresIn: '2h' }
    );

    res.json({
      message: 'Guest session created',
      token,
      sessionId,
      user: {
        id: guestId,
        email: 'guest@demo.com',
        firstName: 'Guest',
        lastName: 'User',
        isGuest: true
      }
    });

  } catch (error) {
    console.error('Guest login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 