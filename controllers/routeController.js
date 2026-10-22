const Route = require('../models/Route');
const Stop = require('../models/Stop');
const Fare = require('../models/Fare');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

// Checks that stops is an array of at least 2 ids and that every stop exists.
async function validateStops(stopIds) {
  if (!Array.isArray(stopIds) || stopIds.length < 2) {
    throw httpError(400, 'stops must be an array of at least 2 stop ids');
  }
  const unique = [...new Set(stopIds.map(String))];
  const found = await Stop.countDocuments({ _id: { $in: unique } });
  if (found !== unique.length) throw httpError(400, 'One or more stop ids do not exist');
}

async function validateFare(fareId) {
  if (fareId && !(await Fare.exists({ _id: fareId }))) {
    throw httpError(400, 'fareId does not exist');
  }
}

// GET /api/routes?mode=&isActive=
const getRoutes = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.mode) filter.mode = String(req.query.mode);
  if (req.query.isActive) filter.isActive = req.query.isActive === 'true';

  const routes = await Route.find(filter).populate('fareId').sort('name');
  res.json({ count: routes.length, routes });
});

// GET /api/routes/:id  (includes the stops in order)
const getRoute = asyncHandler(async (req, res) => {
  const route = await Route.findById(req.params.id).populate('stops').populate('fareId');
  if (!route) throw httpError(404, 'Route not found');
  res.json({ route });
});

// POST /api/routes  (admin)  body: { name, mode, stops: [stopId, ...], path?, fareId?, isActive? }
const createRoute = asyncHandler(async (req, res) => {
  const { name, mode, stops, path, fareId, isActive } = req.body;
  await validateStops(stops);
  await validateFare(fareId);

  const route = await Route.create({ name, mode, stops, path, fareId, isActive });
  res.status(201).json({ route });
});

// PUT /api/routes/:id  (admin)
const updateRoute = asyncHandler(async (req, res) => {
  const route = await Route.findById(req.params.id);
  if (!route) throw httpError(404, 'Route not found');

  for (const field of ['name', 'mode', 'path', 'isActive']) {
    if (req.body[field] !== undefined) route[field] = req.body[field];
  }
  if (req.body.stops !== undefined) {
    await validateStops(req.body.stops);
    route.stops = req.body.stops;
  }
  if (req.body.fareId !== undefined) {
    await validateFare(req.body.fareId);
    route.fareId = req.body.fareId;
  }

  await route.save();
  res.json({ route });
});

// DELETE /api/routes/:id  (admin)
const deleteRoute = asyncHandler(async (req, res) => {
  const route = await Route.findByIdAndDelete(req.params.id);
  if (!route) throw httpError(404, 'Route not found');
  res.json({ message: 'Route deleted' });
});

module.exports = { getRoutes, getRoute, createRoute, updateRoute, deleteRoute };
