const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, 
    code: { type: String, trim: true },                  
    mode: {
      type: String,
      enum: ['jeepney', 'uv_express', 'bus', 'tricycle'],
      required: true,
    },
    
    stops: [
      {
        stop: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop', required: true },
        order: { type: Number, required: true },
      },
    ],
    distanceKm: { type: Number, min: 0 },
    estimatedMinutes: { type: Number, min: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Find routes that pass through a given stop (used for search and transfers)
routeSchema.index({ 'stops.stop': 1 });

module.exports = mongoose.model('Route', routeSchema);