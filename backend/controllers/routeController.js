const Route = require('../models/Route');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

// ==========================================
// GET ROUTES
// ==========================================

// GET /api/routes
// (Gets all routes, optionally filtering by mode or active status)
const getRoutes = asyncHandler(async (req, res) => {
  const filter = {};
  if (typeof req.query.mode === 'string') filter.mode = req.query.mode;
  if (req.query.isActive === 'true' || req.query.isActive === 'false') {
    filter.isActive = req.query.isActive === 'true';
  }

  const routes = await Route.find(filter)
    .populate('stops.stop', 'name')
    .populate('createdBy', 'name')
    .sort('name');

  res.json({ count: routes.length, routes });
});

// GET /api/routes/:id
// (Gets a single route by its ID)
const getRouteById = asyncHandler(async (req, res) => {
  const route = await Route.findById(req.params.id)
    .populate('stops.stop', 'name')
    .populate('createdBy', 'name');

  if (!route) throw httpError(404, 'Route not found');

  res.json({ route });
});

// ==========================================
// CREATE & UPDATE ROUTES (Admin)
// ==========================================

// POST /api/routes
const createRoute = asyncHandler(async (req, res) => {
  const { 
    name, code, mode, stops, distanceKm, estimatedMinutes, isActive 
  } = req.body;

  // Create the route
  const route = await Route.create({
    name,
    code,
    mode,
    stops, // Expects an array like: [{ stop: "id_here", order: 1 }, ...]
    distanceKm,
    estimatedMinutes,
    isActive,
    createdBy: req.user._id // Assumes protect middleware is applied
  });

  res.status(201).json({ route });
});

// PUT /api/routes/:id
const updateRoute = asyncHandler(async (req, res) => {
  const route = await Route.findById(req.params.id);
  if (!route) throw httpError(404, 'Route not found');

  // Update simple fields if they are provided in the request body
  const fieldsToUpdate = ['name', 'code', 'mode', 'distanceKm', 'estimatedMinutes', 'isActive'];
  for (const field of fieldsToUpdate) {
    if (req.body[field] !== undefined) {
      route[field] = req.body[field];
    }
  }

  // Handle the nested stops array separately
  if (req.body.stops) {
    route.stops = req.body.stops; // Replaces the whole array of stops
  }

  const updatedRoute = await route.save();
  res.json({ route: updatedRoute });
});

// DELETE /api/routes/:id
const deleteRoute = asyncHandler(async (req, res) => {
  const route = await Route.findById(req.params.id);
  if (!route) throw httpError(404, 'Route not found');

  await route.deleteOne();
  res.json({ message: 'Route deleted successfully' });
});

module.exports = {
  getRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute
};