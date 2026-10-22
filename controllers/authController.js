const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const { signToken, publicUser } = require('../services/authService');

// POST /api/auth/register
// Everyone who registers is a commuter. Admins are created in the database or the seed script.
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw httpError(400, 'name, email and password are required');
  }

  const cleanEmail = String(email).toLowerCase().trim();
  if (await User.findOne({ email: cleanEmail })) {
    throw httpError(409, 'Email is already registered');
  }

  const user = await User.create({ name, email: cleanEmail, password: String(password) });
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw httpError(400, 'email and password are required');

  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
  if (!user || !(await user.comparePassword(String(password)))) {
    throw httpError(401, 'Invalid email or password');
  }

  res.json({ token: signToken(user), user: publicUser(user) });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

module.exports = { register, login, getMe };
