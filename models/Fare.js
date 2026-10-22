const mongoose = require('mongoose');
const { MODES } = require('../config/constants');

const fareSchema = new mongoose.Schema(
  {
    mode: { type: String, enum: MODES, required: [true, 'Mode is required'], unique: true },
    baseFare: { type: Number, required: [true, 'Base fare is required'], min: 0 },
    perKmRate: { type: Number, default: 0, min: 0 },
    // 0.2 means 20% off for students, seniors and PWDs
    discountRate: { type: Number, default: 0.2, min: 0, max: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Fare', fareSchema);
