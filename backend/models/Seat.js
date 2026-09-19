const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  id:          { type: String, unique: true },
  row:         String,
  number:      Number,
  type:        { type: String, enum: ['AC', 'NON_AC'] },
  status:      { type: String, default: 'available' }, // available | pending | booked | unavailable
  price:       Number,
  studentName: { type: String, default: null },
  bookingId:   { type: String, default: null },
  expiresAt:   { type: Date,   default: null }, // mirrors the current booking's expiry for quick admin filtering
});

module.exports = mongoose.model('Seat', seatSchema);
