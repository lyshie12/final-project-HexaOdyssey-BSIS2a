const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const { parseCoords } = require('../utils/geo');
const { findDirectRoutes } = require('../services/searchService');

// POST /api/routes/search
// body: { origin: { lat, lng }, destination: { lat, lng }, radius?: meters }
const searchRoutes = asyncHandler(async (req, res) => {
  const { origin, destination } = req.body;
  if (!origin || !destination) throw httpError(400, 'origin and destination are required');

  const from = parseCoords(origin.lat, origin.lng);
  const to = parseCoords(destination.lat, destination.lng);
  const radius = Math.min(Number(req.body.radius) || 500, 5000); // meters

  const { originStops, destinationStops, options } = await findDirectRoutes(from, to, radius);

  res.json({
    count: options.length,
    options,
    nearOrigin: originStops.length,
    nearDestination: destinationStops.length,
    note: 'Direct routes only. Routes with transfers are not supported yet.',
  });
});

module.exports = { searchRoutes };
