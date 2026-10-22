const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, 
    },
  },
  { _id: false }
);

const savedTripSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, trim: true },
    origin: { type: placeSchema, required: true },
    destination: { type: placeSchema, required: true },
    
    routes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Route' }],
    passengerType: {
      type: String,
      enum: ['regular', 'student', 'senior', 'pwd'],
      default: 'regular',
    },
    estimatedFare: { type: Number, min: 0 },
    estimatedMinutes: { type: Number, min: 0 },
  },
  { timestamps: true }
);

savedTripSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('SavedTrip', savedTripSchema);