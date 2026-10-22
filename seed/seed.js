// Fills the database with SAMPLE data so you can test the API.
// Run with: npm run seed
// WARNING: this deletes everything in the database first. Never run it on real data.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Stop = require('../models/Stop');
const Route = require('../models/Route');
const Fare = require('../models/Fare');
const Report = require('../models/Report');

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@dagos.local';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';

// PLACEHOLDER fares. Replace with real LTFRB or surveyed values.
const fares = [
  { mode: 'jeepney', baseFare: 13, perKmRate: 1.8, discountRate: 0.2 },
  { mode: 'uv_express', baseFare: 25, perKmRate: 2.5, discountRate: 0.2 },
  { mode: 'bus', baseFare: 15, perKmRate: 2.2, discountRate: 0.2 },
  { mode: 'tricycle', baseFare: 20, perKmRate: 0, discountRate: 0.2 },
];

// SAMPLE stops with approximate coordinates along the Legazpi to Daraga road.
// Replace with surveyed stops. Each entry is [name, municipality, lat, lng].
const stopData = [
  ['Legazpi City Proper (sample)', 'Legazpi', 13.1391, 123.7438],
  ['Legazpi Mid Stop 1 (sample)', 'Legazpi', 13.142, 123.73],
  ['Legazpi Mid Stop 2 (sample)', 'Legazpi', 13.145, 123.72],
  ['Daraga Crossing (sample)', 'Daraga', 13.148, 123.71],
  ['Daraga Poblacion (sample)', 'Daraga', 13.15, 123.7],
];

async function seed() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed in production');
  }
  await connectDB();

  await Promise.all([
    Report.deleteMany(), Route.deleteMany(), Stop.deleteMany(), Fare.deleteMany(), User.deleteMany(),
  ]);

  const createdFares = await Fare.insertMany(fares);
  const jeepneyFare = createdFares.find((f) => f.mode === 'jeepney');

  const stops = await Stop.insertMany(
    stopData.map(([name, municipality, lat, lng]) => ({
      name,
      municipality,
      location: { type: 'Point', coordinates: [lng, lat] },
    }))
  );
  await Stop.init(); // make sure the 2dsphere index exists

  const ids = stops.map((s) => s._id);
  await Route.create([
    { name: 'Legazpi - Daraga Jeepney (sample)', mode: 'jeepney', stops: ids, fareId: jeepneyFare._id },
    { name: 'Daraga - Legazpi Jeepney (sample)', mode: 'jeepney', stops: [...ids].reverse(), fareId: jeepneyFare._id },
  ]);

  await User.create({ name: 'Dagos Admin', email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' });

  console.log('Seed complete: 4 fares, 5 stops, 2 routes, 1 admin user');
  console.log(`Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
