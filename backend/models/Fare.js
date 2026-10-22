const mongoose = require('mongoose');


const fareSchema = new mongoose.Schema(
  {
    mode: {
      type: String,
      enum: ['jeepney', 'uv_express', 'bus', 'tricycle'],
      required: true,
    },
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' }, 
    baseFare: { type: Number, required: true, min: 0 },
    baseDistanceKm: { type: Number, default: 0, min: 0 },
    perKmRate: { type: Number, default: 0, min: 0 },
    
    discounts: {
      student: { type: Number, default: 0.2, min: 0, max: 1 },
      senior: { type: Number, default: 0.2, min: 0, max: 1 },
      pwd: { type: Number, default: 0.2, min: 0, max: 1 },
    },
    effectiveDate: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Fare', fareSchema);