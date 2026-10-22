const mongoose = require('mongoose');
const { REPORT_STATUSES } = require('../config/constants');

const reportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description is too long (max 1000 characters)'],
    },
    status: { type: String, enum: REPORT_STATUSES, default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
