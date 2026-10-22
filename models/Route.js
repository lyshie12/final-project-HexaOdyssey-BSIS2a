const mongoose = require('mongoose');
const { MODES } = require('../config/constants');

const routeSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Route name is required'], trim: true },
    mode: { type: String, enum: MODES, required: [true, 'Mode is required'] },
    // Ordered list: the vehicle visits the stops in this order.
    stops: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stop' }],
      validate: [(v) => v.length >= 2, 'A route needs at least 2 stops'],
    },
    // Optional line drawn on the map. GeoJSON LineString: [[lng, lat], ...]
    path: {
      type: { type: String, enum: ['LineString'] },
      coordinates: { type: [[Number]], default: undefined },
    },
    fareId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fare' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

routeSchema.index({ stops: 1 });

module.exports = mongoose.model('Route', routeSchema);
