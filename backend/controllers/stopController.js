const Stop = require('../models/Stop');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

// ==========================================
// GET STOPS
// ==========================================

// GET /api/stops
// (Gets all stops, with optional filtering by mode)
const getStops = asyncHandler(async (req, res) => {
  const queryObj = { ...req.query };
  
  const stops = await Stop.find(queryObj)
    .populate('createdBy', 'name')
    .sort('name');

  res.json({ count: stops.length, stops });
});

// GET /api/stops/:id
const getStopById = asyncHandler(async (req, res) => {
  const stop = await Stop.findById(req.params.id).populate('createdBy', 'name');
  if (!stop) throw httpError(404, 'Stop not found');

  res.json({ stop });
});

// GET /api/stops/nearby
// (Finds stops within a certain radius. Example: ?lng=123.8&lat=13.1&radius=5000)
const getNearbyStops = asyncHandler(async (req, res) => {
  const { lng, lat, radius = 1000 } = req.query; // Radius in meters

  if (!lng || !lat) {
    throw httpError(400, 'Please provide longitude and latitude coordinates');
  }

  const stops = await Stop.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)] // Must be [lng, lat]
        },
        $maxDistance: parseFloat(radius)
      }
    },
    isActive: true // Only return active stops
  });

  res.json({ count: stops.length, stops });
});

// ==========================================
// CREATE & UPDATE STOPS (Admin)
// ==========================================

// POST /api/stops
const createStop = asyncHandler(async (req, res) => {
  const { name, mode, landmark, location, isActive } = req.body;

  const stop = await Stop.create({
    name,
    mode,
    landmark,
    location,
    isActive,
    createdBy: req.user._id // Assumes protect middleware is applied
  });

  res.status(201).json({ stop });
});

// PUT /api/stops/:id
const updateStop = asyncHandler(async (req, res) => {
  const stop = await Stop.findById(req.params.id);
  if (!stop) throw httpError(404, 'Stop not found');

  // Update simple fields
  const fieldsToUpdate = ['name', 'mode', 'landmark', 'isActive'];
  for (const field of fieldsToUpdate) {
    if (req.body[field] !== undefined) {
      stop[field] = req.body[field];
    }
  }

  // Handle nested location updates safely
  if (req.body.location) {
    stop.location = req.body.location;
  }

  const updatedStop = await stop.save();
  res.json({ stop: updatedStop });
});

// DELETE /api/stops/:id
const deleteStop = asyncHandler(async (req, res) => {
  const stop = await Stop.findById(req.params.id);
  if (!stop) throw httpError(404, 'Stop not found');

  await stop.deleteOne();
  res.json({ message: 'Stop deleted successfully' });
});

module.exports = {
  getStops,
  getStopById,
  getNearbyStops,
  createStop,
  updateStop,
  deleteStop
};