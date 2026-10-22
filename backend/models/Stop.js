const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mode: {
      type: String,
      enum: ['jeepney', 'uv_express', 'bus', 'tricycle'],
      required: true,
    },
    landmark: { type: String, trim: true },
    
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);


stopSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Stop', stopSchema);