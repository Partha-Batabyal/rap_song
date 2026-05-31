import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbService } from '../services/dbService.js';

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'rapvault_super_secret_jwt_key_999123', {
    expiresIn: '30d'
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  const { username, email, password, profileImage } = req.body;

  try {
    // Basic validations
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists in DB
    const emailExists = await dbService.findUserByEmail(email);
    if (emailExists) {
      return res.status(400).json({ message: 'Email address is already registered' });
    }

    const usernameExists = await dbService.findUserByUsername(username);
    if (usernameExists) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user
    const user = await dbService.createUser({
      username,
      email,
      password: hashedPassword,
      profileImage: profileImage || ''
    });

    // Return user info + JWT
    return res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

/**
 * @desc    Auth user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user
    const user = await dbService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Return user info + JWT
    return res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * @desc    Get user profile and statistics
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getUserProfile = async (req, res) => {
  try {
    // req.user is already loaded by authMiddleware
    const stats = await dbService.getUserStats(req.user._id);

    return res.json({
      user: {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        profileImage: req.user.profileImage,
        createdAt: req.user.createdAt
      },
      stats
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

/**
 * @desc    Update user profile details
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res) => {
  const { username, email, profileImage, currentPassword, newPassword } = req.body;

  try {
    const userId = req.user._id;
    const user = await dbService.findUserByIdWithPassword(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updates = {};

    // Validate email/username uniqueness if changing
    if (username && username !== user.username) {
      const usernameExists = await dbService.findUserByUsername(username);
      if (usernameExists) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      updates.username = username;
    }

    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const emailExists = await dbService.findUserByEmail(email);
      if (emailExists) {
        return res.status(400).json({ message: 'Email address is already in use' });
      }
      updates.email = email;
    }

    if (profileImage !== undefined) {
      updates.profileImage = profileImage;
    }

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Please provide current password to set a new password' });
      }

      // Check current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Incorrect current password' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(newPassword, salt);
    }

    const updatedUser = await dbService.updateUser(userId, updates);

    return res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      profileImage: updatedUser.profileImage,
      token: generateToken(updatedUser._id) // issue fresh token
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: error.message || 'Server error updating profile' });
  }
};
