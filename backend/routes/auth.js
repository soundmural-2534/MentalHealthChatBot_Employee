const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { sendPasswordResetEmail } = require('../utils/emailService');

const router = express.Router();

// Create unique index on email field for users database
db.users.ensureIndex({ fieldName: 'email', unique: true });

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      name: user.name
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, firstName, lastName, email, password, department, employeeId } = req.body;

    // Handle both old and new field formats for backwards compatibility
    const fullName = name || (firstName && lastName ? `${firstName} ${lastName}` : '');
    const userDepartment = department || 'General';

    // Validate required fields (support both formats)
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await db.users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: `An account with email "${email}" already exists. Please sign in instead or use a different email address.` 
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user object
    const newUser = {
      id: uuidv4(),
      name: fullName,
      firstName: firstName || fullName.split(' ')[0], // For backwards compatibility
      lastName: lastName || fullName.split(' ').slice(1).join(' '), // For backwards compatibility
      email: email.toLowerCase(),
      password: hashedPassword,
      department: userDepartment,
      employeeId: employeeId || null, // For backwards compatibility
      createdAt: new Date().toISOString(),
      lastLogin: null,
      isActive: true
    };

    // Save user to database
    const savedUser = await db.users.insert(newUser);

    // Generate JWT token
    const token = generateToken(savedUser);

    // Generate session ID for compatibility
    const sessionId = uuidv4();

    // Return success response (don't send password)
    const { password: _, ...userWithoutPassword } = savedUser;
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      sessionId, // Add sessionId for frontend compatibility
      user: userWithoutPassword
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

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await db.users.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email or password. Please check your credentials and try again.' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Your account has been deactivated. Please contact support for assistance.' 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid email or password. Please check your credentials and try again.' 
      });
    }

    // Update last login
    await db.users.update(
      { _id: user._id },
      { $set: { lastLogin: new Date().toISOString() } }
    );

    // Generate JWT token
    const token = generateToken(user);

    // Generate session ID for compatibility
    const sessionId = uuidv4();

    // Return success response (don't send password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login successful',
      token,
      sessionId, // Add sessionId for frontend compatibility
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Verify token endpoint
router.get('/verify', verifyToken, async (req, res) => {
  try {
    // Get updated user data from database
    const user = await db.users.findOne({ id: req.user.id });
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      valid: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout (client handles token removal)
router.post('/logout', verifyToken, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, department } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (name) updateData.name = name;
    if (department) updateData.department = department;
    updateData.updatedAt = new Date().toISOString();

    // Update user in database
    await db.users.update(
      { id: userId },
      { $set: updateData }
    );

    // Get updated user data
    const updatedUser = await db.users.findOne({ id: userId });
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Change password
router.put('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    // Get user data
    const user = await db.users.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    await db.users.update(
      { id: userId },
      { 
        $set: { 
          password: hashedNewPassword,
          updatedAt: new Date().toISOString()
        }
      }
    );

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user statistics (for admin or analytics)
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's chat statistics
    const totalSessions = await db.chatSessions.count({ userId });
    const activeSessions = await db.chatSessions.count({ userId, active: true });
    const totalMessages = await db.chatMessages.count({ 
      sessionId: { $in: (await db.chatSessions.find({ userId }, { id: 1 })).map(s => s.id) }
    });
    const moodRatings = await db.moodRatings.count({ userId });

    res.json({
      userStats: {
        totalChatSessions: totalSessions,
        activeChatSessions: activeSessions,
        totalMessages,
        moodRatingsSubmitted: moodRatings,
        memberSince: req.user.createdAt
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Forgot password - generate reset token
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    const user = await db.users.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ 
        message: 'If an account with this email exists, a password reset link has been sent.' 
      });
    }

    // Generate reset token and expiration (1 hour)
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now

    // Save reset token to user
    await db.users.update(
      { id: user.id },
      { 
        $set: { 
          resetToken,
          resetTokenExpiry,
          updatedAt: new Date().toISOString()
        }
      }
    );

    // Create reset link
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;
    
    // Format expiry time for email
    const expiryTime = new Date(Date.now() + 3600000).toLocaleString();

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(
      user.email, 
      user.name, 
      resetLink, 
      expiryTime
    );

    if (emailResult.success) {
      console.log(`Password reset email sent to: ${user.email}`);
      
      res.json({ 
        message: 'If an account with this email exists, a password reset link has been sent.',
        // In development, also return the token for testing
        ...(process.env.NODE_ENV === 'development' && { 
          resetToken, 
          resetLink,
          emailSent: true
        })
      });
    } else {
      console.error('Failed to send password reset email:', emailResult.error);
      
      // For development, still log the reset link
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n=== PASSWORD RESET REQUEST (EMAIL FAILED) ===`);
        console.log(`Email: ${email}`);
        console.log(`Reset Link: ${resetLink}`);
        console.log(`Token: ${resetToken}`);
        console.log(`Expires: ${resetTokenExpiry}`);
        console.log(`===============================\n`);
      }
      
      res.json({ 
        message: 'If an account with this email exists, a password reset link has been sent.',
        // In development, also return the token for testing even if email failed
        ...(process.env.NODE_ENV === 'development' && { 
          resetToken, 
          resetLink,
          emailSent: false,
          emailError: emailResult.error
        })
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validate input
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Find user with valid reset token
    const user = await db.users.findOne({ 
      resetToken: token,
      resetTokenExpiry: { $gt: new Date().toISOString() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token. Please request a new password reset.' 
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    await db.users.update(
      { id: user.id },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date().toISOString()
        },
        $unset: {
          resetToken: '',
          resetTokenExpiry: ''
        }
      }
    );

    console.log(`Password successfully reset for user: ${user.email}`);

    res.json({ message: 'Password has been reset successfully. You can now log in with your new password.' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Guest login (for demo purposes)
router.post('/guest', (req, res) => {
  try {
    const guestId = uuidv4();
    const sessionId = uuidv4();

    const guestUser = {
      id: guestId,
      name: 'Guest User',
      firstName: 'Guest',
      lastName: 'User',
      email: 'guest@demo.com',
      department: 'Demo',
      isGuest: true,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const token = jwt.sign(
      { 
        id: guestId,
        email: 'guest@demo.com',
        name: 'Guest User',
        isGuest: true
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '2h' }
    );

    res.json({
      message: 'Guest session created',
      token,
      sessionId,
      user: guestUser
    });

  } catch (error) {
    console.error('Guest login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 