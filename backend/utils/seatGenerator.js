const Seat = require('../models/Seat');

// Used only to seed MongoDB on first run. Prices come from Settings so the
// admin's fee-customization values (if already set) are honored on seed too.
// Both AC and Non-AC seats are simple sequential number ranges (from..to) —
// no fixed floor-plan layout, no row letters, no upper limit.
function generateSeats(acPrice = 1499, nonAcPrice = 900, acFrom = 1, acTo = 60, nonAcFrom = 1, nonAcTo = 90) {
  const seats = [];
  // AC seats — simple numbered range, admin sets the "from" and "to"
  for (let n = acFrom; n <= acTo; n++) {
    seats.push({ id: `AC${n}`, number: n, type: 'AC', status: 'available', price: acPrice, studentName: null, bookingId: null });
  }
  // Non-AC seats — simple numbered range, admin sets the "from" and "to"
  for (let n = nonAcFrom; n <= nonAcTo; n++) {
    seats.push({ id: `NAC${n}`, number: n, type: 'NON_AC', status: 'available', price: nonAcPrice, studentName: null, bookingId: null });
  }
  return seats;
}

// Make sure a Seat document exists for every seat number in the admin-set
// acFrom..acTo range. Existing seats (and their booking status) are left
// untouched — this only ever ADDS missing seat documents, never deletes
// any, so shrinking the range and growing it back later never loses data.
async function ensureAcSeats(acFrom, acTo, acPrice = 1499) {
  const wanted = [];
  for (let n = acFrom; n <= acTo; n++) {
    wanted.push({ id: `AC${n}`, number: n, type: 'AC', status: 'available', price: acPrice, studentName: null, bookingId: null });
  }
  const existingIds = new Set((await Seat.find({ type: 'AC' }, { id: 1 }).lean()).map(s => s.id));
  const missing = wanted.filter(s => !existingIds.has(s.id));
  if (missing.length) await Seat.insertMany(missing);
  return missing.length;
}

// Make sure a Seat document exists for every seat number in the admin-set
// nonAcFrom..nonAcTo range. Existing seats (and their booking status) are
// left untouched — this only ever ADDS missing seat documents, never
// deletes any, so shrinking the range and growing it back later never
// loses data.
async function ensureNonAcSeats(nonAcFrom, nonAcTo, nonAcPrice = 900) {
  const wanted = [];
  for (let n = nonAcFrom; n <= nonAcTo; n++) {
    wanted.push({ id: `NAC${n}`, number: n, type: 'NON_AC', status: 'available', price: nonAcPrice, studentName: null, bookingId: null });
  }
  const existingIds = new Set((await Seat.find({ type: 'NON_AC' }, { id: 1 }).lean()).map(s => s.id));
  const missing = wanted.filter(s => !existingIds.has(s.id));
  if (missing.length) await Seat.insertMany(missing);
  return missing.length;
}

module.exports = { generateSeats, ensureAcSeats, ensureNonAcSeats };
