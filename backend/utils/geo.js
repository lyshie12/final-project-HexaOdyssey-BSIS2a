const httpError = require('./httpError');

const EARTH_RADIUS_KM = 6371;
const toRad = (deg) => (deg * Math.PI) / 180;

// Straight-line distance in km between two points given as [lng, lat] (GeoJSON order).
function haversineKm(a, b) {
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

// Validate and convert lat/lng values from a request.
function parseCoords(lat, lng) {
  const la = Number(lat);
  const lo = Number(lng);
  const bad =
    lat == null || lng == null || lat === '' || lng === '' ||
    !Number.isFinite(la) || !Number.isFinite(lo) ||
    la < -90 || la > 90 || lo < -180 || lo > 180;
  if (bad) {
    throw httpError(400, 'lat and lng must be valid numbers (lat -90 to 90, lng -180 to 180)');
  }
  return { lat: la, lng: lo };
}

// GeoJSON Point. Note the order: [longitude, latitude].
const toPoint = (lat, lng) => ({ type: 'Point', coordinates: [lng, lat] });

module.exports = { haversineKm, parseCoords, toPoint };
