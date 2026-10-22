const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['wrong_route', 'missing_route', 'changed_route', 'wrong_stop', 'missing_stop'],
      required: true,
    },
    
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
    stop: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop' },
    description: { type: String, required: true, trim: true },
   
    proposedChanges: { type: mongoose.Schema.Types.Mixed },

   
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    reviewNote: { type: String, trim: true },
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);