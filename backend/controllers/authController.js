const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const jwt = require('jsonwebtoken');

// Helper function to generate a JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ==========================================
// PUBLIC ROUTES
// ==========================================

// POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, passengerType } = req.body;

  // 1. Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw httpError(400, 'User already exists with this email');
  }

  // 2. Create the user (Password hashing happens automatically in the Model)
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'commuter', // Default to commuter if not provided
    passengerType: passengerType || 'regular',
  });

  // 3. Send back user data (excluding password) and a token
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    passengerType: user.passengerType,
    token: generateToken(user._id),
  });
});

// POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Find the user and EXPLICITLY ask for the password (because select: false hides it)
  const user = await User.findOne({ email }).select('+password');

  // 2. Check if user exists AND if the password matches
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      passengerType: user.passengerType,
      token: generateToken(user._id),
    });
  } else {
    throw httpError(401, 'Invalid email or password');
  }
});

// ==========================================
// PRIVATE ROUTES (Requires Login)
// ==========================================

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  // req.user is set by your 'protect' middleware
  // Password is automatically excluded because of select: false
  const user = await User.findById(req.user.id);
  res.json({ user });
});

// PUT /api/auth/profile
// (Allows a user to update their name or passenger type)
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) throw httpError(404, 'User not found');

  // Update fields if they are provided
  if (req.body.name) user.name = req.body.name;
  if (req.body.passengerType) user.passengerType = req.body.passengerType;

  // If they want to update their password, handle the hashing
  if (req.body.password) {
    user.password = req.body.password;
    // Note: The pre('save') hook in the model will automatically re-hash this!
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    passengerType: updatedUser.passengerType,
    token: generateToken(updatedUser._id), // Send a fresh token
  });
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile
};