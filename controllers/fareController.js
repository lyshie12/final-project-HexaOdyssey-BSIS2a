const Fare = require('../models/Fare');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

// GET /api/fares
const getFares = asyncHandler(async (req, res) => {
  const fares = await Fare.find().sort('mode');
  res.json({ count: fares.length, fares });
});

// POST /api/fares  (admin)  body: { mode, baseFare, perKmRate?, discountRate? }
const createFare = asyncHandler(async (req, res) => {
  const { mode, baseFare, perKmRate, discountRate } = req.body;
  const fare = await Fare.create({ mode, baseFare, perKmRate, discountRate });
  res.status(201).json({ fare });
});

// PUT /api/fares/:id  (admin)
const updateFare = asyncHandler(async (req, res) => {
  const fare = await Fare.findById(req.params.id);
  if (!fare) throw httpError(404, 'Fare not found');

  for (const field of ['mode', 'baseFare', 'perKmRate', 'discountRate']) {
    if (req.body[field] !== undefined) fare[field] = req.body[field];
  }

  await fare.save();
  res.json({ fare });
});

module.exports = { getFares, createFare, updateFare };
