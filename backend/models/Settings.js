const mongoose = require('mongoose');

// Global, single-document settings: seat-count limits, QR codes, UPI id.
const settingsSchema = new mongoose.Schema({
  key:            { type: String, unique: true, default: 'main' },
  companyName:    { type: String, default: 'ReadSpace' }, // brand name shown across the site — admin-editable
  logoImage:      { type: String, default: null }, // base64 data URI of the uploaded logo (falls back to 📚 emoji when unset)
  city:           { type: String, default: 'Chh Sambhajinagar' }, // shown wherever the city name appears across the site (hero tag, titles, footers, SEO meta)
  address:        { type: String, default: 'Ajab Nagar, Chh. Sambhajinagar, Maharashtra 431001' }, // full postal address shown on the Contact page
  contactEmail:   { type: String, default: 'info@readspace.in' },
  contactPhone:   { type: String, default: '+91 98765 43210' },
  contactHours:   { type: String, default: 'Mon–Sat: 6:00 AM – 11:00 PM' },
  instagramUrl:   { type: String, default: '' }, // social links shown on Contact page — icon only shows when set
  linkedinUrl:    { type: String, default: '' },
  facebookUrl:    { type: String, default: '' },
  youtubeUrl:     { type: String, default: '' },
  mapEmbedUrl:    { type: String, default: '' }, // Google Maps link admin pastes — auto-converted to an embeddable URL for the Contact page map
  acSeatFrom:     { type: Number, default: 1 },   // first AC seat number shown (admin-configurable, no upper limit)
  acSeatTo:       { type: Number, default: 60 },  // last AC seat number shown (admin-configurable, no upper limit)
  nonAcSeatFrom:  { type: Number, default: 1 },   // first Non-AC seat number shown (admin-configurable, no upper limit)
  nonAcSeatTo:    { type: Number, default: 90 },  // last Non-AC seat number shown (admin-configurable, no upper limit)
  acQrImage:      { type: String, default: null }, // base64 data URI of the AC-zone payment QR
  nonAcQrImage:   { type: String, default: null }, // base64 data URI of the Non-AC-zone payment QR
  upiId:          { type: String, default: 'readspace@upi' },
  acPrice:        { type: Number, default: 1499 }, // ₹/month for AC seats — editable from admin panel
  nonAcPrice:     { type: Number, default: 900 },  // ₹/month for Non-AC seats — editable from admin panel
});

module.exports = mongoose.model('Settings', settingsSchema);
