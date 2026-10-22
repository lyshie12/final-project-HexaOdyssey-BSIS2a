const mongoose = require('mongoose');

const validCoordinates = (v) =>
  Array.isArray(v) &&
  v.length === 2 &&
  v[0] >= -180 && v[0] <= 180 && // longitude
  v[1] >= -90 && v[1] <= 90; // latitude

const stopSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Stop name is required'], trim: true },
    municipality: { type: String, required: [true, 'Municipality is required'], trim: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Location coordinates are required'],
        validate: [validCoordinates, 'coordinates must be [longitude, latitude]'],
      },
    },
  },
  { timestamps: true }
);

// Needed for "stops near this point" queries.
stopSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Stop', stopSchema);
