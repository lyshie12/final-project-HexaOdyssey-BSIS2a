const Stop = require('../models/Stop');
const Route = require('../models/Route');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const { parseCoords, toPoint } = require('../utils/geo');
const { findNearbyStops } = require('../services/searchService');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/stops?q=&municipality=&page=&limit=
const getStops = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.q) filter.name = new RegExp(escapeRegex(String(req.query.q)), 'i');
  if (req.query.municipality) {
    filter.municipality = new RegExp(`^${escapeRegex(String(req.query.municipality))}$`, 'i');
  }

  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

  const [stops, total] = await Promise.all([
    Stop.find(filter).sort('name').skip((page - 1) * limit).limit(limit),
    Stop.countDocuments(filter),
  ]);
  res.json({ total, page, count: stops.length, stops });
});

// GET /api/stops/nearby?lat=&lng=&radius=
const getNearbyStops = asyncHandler(async (req, res) => {
  const { lat, lng } = parseCoords(req.query.lat, req.query.lng);
  const radius = Math.min(Number(req.query.radius) || 500, 5000); // meters
  const stops = await findNearbyStops({ lat, lng }, radius, 20);
  res.json({ count: stops.length, stops });
});

// GET /api/stops/:id
const getStop = asyncHandler(async (req, res) => {
  const stop = await Stop.findById(req.params.id);
  if (!stop) throw httpError(404, 'Stop not found');
  res.json({ stop });
});

// POST /api/stops  (admin)  body: { name, municipality, lat, lng }
const createStop = asyncHandler(async (req, res) => {
  const { name, municipality, lat, lng } = req.body;
  const coords = parseCoords(lat, lng);
  const stop = await Stop.create({ name, municipality, location: toPoint(coords.lat, coords.lng) });
  res.status(201).json({ stop });
});

// PUT /api/stops/:id  (admin)
const updateStop = asyncHandler(async (req, res) => {
  const stop = await Stop.findById(req.params.id);
  if (!stop) throw httpError(404, 'Stop not found');

  const { name, municipality, lat, lng } = req.body;
  if (name !== undefined) stop.name = name;
  if (municipality !== undefined) stop.municipality = municipality;
  if (lat !== undefined || lng !== undefined) {
    const coords = parseCoords(lat, lng);
    stop.location = toPoint(coords.lat, coords.lng);
  }

  await stop.save();
  res.json({ stop });
});

// DELETE /api/stops/:id  (admin)
const deleteStop = asyncHandler(async (req, res) => {
  if (await Route.exists({ stops: req.params.id })) {
    throw httpError(409, 'This stop is used by a route. Remove it from the route first.');
  }
  const stop = await Stop.findByIdAndDelete(req.params.id);
  if (!stop) throw httpError(404, 'Stop not found');
  res.json({ message: 'Stop deleted' });
});

module.exports = { getStops, getNearbyStops, getStop, createStop, updateStop, deleteStop };
