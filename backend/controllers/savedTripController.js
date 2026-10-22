const SavedTrip = require('../models/SavedTrip');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

// ==========================================
// GET SAVED TRIPS
// ==========================================

// GET /api/saved-trips
// (Gets all saved trips for the logged-in user)
const getSavedTrips = asyncHandler(async (req, res) => {
  // Find trips only where the user matches the logged-in user
  const trips = await SavedTrip.find({ user: req.user._id })
    .populate('routes', 'name code mode') // Brings in route details
    .sort('-createdAt'); // Newest first

  res.json({ count: trips.length, trips });
});

// GET /api/saved-trips/:id
// (Gets a specific saved trip)
const getSavedTripById = asyncHandler(async (req, res) => {
  const trip = await SavedTrip.findById(req.params.id)
    .populate('routes', 'name code mode');

  if (!trip) throw httpError(404, 'Saved trip not found');

  // Security check: Make sure the user requesting it is the one who saved it
  if (trip.user.toString() !== req.user._id.toString()) {
    throw httpError(403, 'Not authorized to view this trip');
  }

  res.json({ trip });
});

// ==========================================
// CREATE & UPDATE TRIPS
// ==========================================

// POST /api/saved-trips
// (Saves a new trip)
const createSavedTrip = asyncHandler(async (req, res) => {
  const { 
    name, 
    origin, 
    destination, 
    routes, 
    passengerType, 
    estimatedFare, 
    estimatedMinutes 
  } = req.body;

  const trip = await SavedTrip.create({
    user: req.user._id, // Automatically link to the logged-in user
    name,
    origin,       // Expects { label: "...", location: { coordinates: [lng, lat] } }
    destination,  // Expects { label: "...", location: { coordinates: [lng, lat] } }
    routes,
    passengerType,
    estimatedFare,
    estimatedMinutes
  });

  res.status(201).json({ trip });
});

// DELETE /api/saved-trips/:id
// (Deletes a saved trip)
const deleteSavedTrip = asyncHandler(async (req, res) => {
  const trip = await SavedTrip.findById(req.params.id);

  if (!trip) throw httpError(404, 'Saved trip not found');

  // Security check: Make sure they own it before deleting
  if (trip.user.toString() !== req.user._id.toString()) {
    throw httpError(403, 'Not authorized to delete this trip');
  }

  await trip.deleteOne();
  res.json({ message: 'Saved trip removed' });
});

module.exports = {
  getSavedTrips,
  getSavedTripById,
  createSavedTrip,
  deleteSavedTrip
};