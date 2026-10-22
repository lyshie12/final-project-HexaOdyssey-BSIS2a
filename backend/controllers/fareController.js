const Fare = require('../models/Fare');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

// GET /api/fares
const getFares = asyncHandler(async (req, res) => {
  const fares = await Fare.find().sort('mode');
  res.json({ count: fares.length, fares });
});

// POST /api/fares (admin)
const createFare = asyncHandler(async (req, res) => {
  // Destructure the fields that actually exist in the model
  const { mode, route, baseFare, baseDistanceKm, perKmRate, discounts } = req.body;
  
  const fare = await Fare.create({ 
    mode, 
    route, 
    baseFare, 
    baseDistanceKm, 
    perKmRate, 
    discounts 
  });
  
  res.status(201).json({ fare });
});

// PUT /api/fares/:id (admin)
const updateFare = asyncHandler(async (req, res) => {
  const fare = await Fare.findById(req.params.id);
  if (!fare) throw httpError(404, 'Fare not found');

  // Update fields if they are provided in the request
  if (req.body.mode) fare.mode = req.body.mode;
  if (req.body.route) fare.route = req.body.route;
  if (req.body.baseFare !== undefined) fare.baseFare = req.body.baseFare;
  if (req.body.baseDistanceKm !== undefined) fare.baseDistanceKm = req.body.baseDistanceKm;
  if (req.body.perKmRate !== undefined) fare.perKmRate = req.body.perKmRate;
  
  // Handle nested discounts safely
  if (req.body.discounts) {
    if (req.body.discounts.student !== undefined) fare.discounts.student = req.body.discounts.student;
    if (req.body.discounts.senior !== undefined) fare.discounts.senior = req.body.discounts.senior;
    if (req.body.discounts.pwd !== undefined) fare.discounts.pwd = req.body.discounts.pwd;
  }

  await fare.save();
  res.json({ fare });
});

module.exports = { getFares, createFare, updateFare };