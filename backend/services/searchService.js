const Stop = require('../models/Stop');
const Route = require('../models/Route');
const Fare = require('../models/Fare');
const { haversineKm, toPoint } = require('../utils/geo');
const { calculateFare } = require('./fareService');

// Stops within `radius` meters of a point, nearest first.
function findNearbyStops(point, radius, limit = 10) {
  return Stop.find({
    location: { $near: { $geometry: toPoint(point.lat, point.lng), $maxDistance: radius } },
  })
    .limit(limit)
    .lean();
}

const walkMeters = (point, stop) =>
  Math.round(haversineKm([point.lng, point.lat], stop.location.coordinates) * 1000);

// Direct routes only (no transfers yet): the route must pass a stop near the origin
// and later a stop near the destination.
async function findDirectRoutes(origin, destination, radius) {
  const [originStops, destinationStops] = await Promise.all([
    findNearbyStops(origin, radius),
    findNearbyStops(destination, radius),
  ]);

  const result = { originStops, destinationStops, options: [] };
  if (!originStops.length || !destinationStops.length) return result;

  const [routes, fares] = await Promise.all([
    Route.find({ isActive: true, stops: { $in: originStops.map((s) => s._id) } })
      .populate('stops')
      .lean(),
    Fare.find().lean(),
  ]);
  const fareByMode = Object.fromEntries(fares.map((f) => [f.mode, f]));
  const fareById = Object.fromEntries(fares.map((f) => [String(f._id), f]));

  for (const route of routes) {
    const ids = route.stops.map((s) => String(s._id));
    let best = null;

    // Pick the boarding/alighting pair with the least walking, in travel order.
    for (const os of originStops) {
      for (let i = 0; i < ids.length; i++) {
        if (ids[i] !== String(os._id)) continue;
        for (const ds of destinationStops) {
          for (let j = i + 1; j < ids.length; j++) {
            if (ids[j] !== String(ds._id)) continue;
            const walk = walkMeters(origin, os) + walkMeters(destination, ds);
            if (!best || walk < best.walk) best = { i, j, os, ds, walk };
          }
        }
      }
    }
    if (!best) continue;

    // Ride distance: sum of the straight lines between the stops passed.
    let rideKm = 0;
    for (let k = best.i; k < best.j; k++) {
      rideKm += haversineKm(route.stops[k].location.coordinates, route.stops[k + 1].location.coordinates);
    }
    rideKm = Math.round(rideKm * 100) / 100;

    const fare = fareById[String(route.fareId)] || fareByMode[route.mode];
    result.options.push({
      routeId: route._id,
      routeName: route.name,
      mode: route.mode,
      board: { stopId: best.os._id, name: best.os.name, walkMeters: walkMeters(origin, best.os) },
      alight: { stopId: best.ds._id, name: best.ds.name, walkMeters: walkMeters(destination, best.ds) },
      stopsCount: best.j - best.i,
      rideDistanceKm: rideKm,
      fare: fare ? calculateFare(fare, rideKm) : null,
      score: best.walk / 1000 + rideKm, // lower is better
    });
  }

  result.options.sort((a, b) => a.score - b.score);
  result.options.forEach((o) => delete o.score);
  return result;
}

module.exports = { findNearbyStops, findDirectRoutes };
