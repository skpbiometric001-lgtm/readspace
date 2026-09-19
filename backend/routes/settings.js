const express = require('express');
const router = express.Router();
const Seat     = require('../models/Seat');
const Settings = require('../models/Settings');
const authAdmin = require('../middleware/auth');
const { getIO } = require('../socket');
const { ensureAcSeats, ensureNonAcSeats } = require('../utils/seatGenerator');

// GET /api/settings — public; the booking page needs this to know how many
// seats to show and which QR code / UPI id to display for each zone.
router.get('/', async (req, res) => {
  let settings = await Settings.findOne({ key: 'main' }).lean();
  if (!settings) settings = (await Settings.create({ key: 'main' })).toObject();
  res.json(settings);
});

// PATCH /api/settings — admin only. Body may include any of: companyName,
// logoImage, city, address, contactEmail, contactPhone, contactHours,
// instagramUrl, linkedinUrl, facebookUrl, youtubeUrl, mapEmbedUrl,
// acSeatFrom, acSeatTo, nonAcSeatFrom, nonAcSeatTo, acQrImage, nonAcQrImage,
// upiId, acPrice, nonAcPrice.
// acQrImage/nonAcQrImage/logoImage should be base64 data URIs (send `null` to clear).
// acSeatFrom/acSeatTo and nonAcSeatFrom/nonAcSeatTo define simple seat-number
// ranges — there is no upper cap, so a reading room with 500 AC seats can
// set e.g. 1 to 500, or 400 to 500 for an extension room.
router.patch('/', authAdmin, async (req, res) => {
  const { companyName, logoImage, city, address, contactEmail, contactPhone, contactHours, instagramUrl, linkedinUrl, facebookUrl, youtubeUrl, mapEmbedUrl, acSeatFrom, acSeatTo, nonAcSeatFrom, nonAcSeatTo, acQrImage, nonAcQrImage, upiId, acPrice, nonAcPrice } = req.body;

  let settings = await Settings.findOne({ key: 'main' });
  if (!settings) settings = await Settings.create({ key: 'main' });

  if (companyName !== undefined) settings.companyName = String(companyName).trim() || 'ReadSpace';
  if (logoImage !== undefined)   settings.logoImage    = logoImage;
  if (city !== undefined)          settings.city          = String(city).trim();
  if (address !== undefined)       settings.address       = String(address).trim();
  if (contactEmail !== undefined)  settings.contactEmail  = String(contactEmail).trim();
  if (contactPhone !== undefined)  settings.contactPhone  = String(contactPhone).trim();
  if (contactHours !== undefined)  settings.contactHours  = String(contactHours).trim();
  if (instagramUrl !== undefined)  settings.instagramUrl  = String(instagramUrl).trim();
  if (linkedinUrl !== undefined)   settings.linkedinUrl   = String(linkedinUrl).trim();
  if (facebookUrl !== undefined)   settings.facebookUrl   = String(facebookUrl).trim();
  if (youtubeUrl !== undefined)    settings.youtubeUrl    = String(youtubeUrl).trim();
  if (mapEmbedUrl !== undefined)   settings.mapEmbedUrl   = String(mapEmbedUrl).trim();
  if (acSeatFrom !== undefined)    settings.acSeatFrom    = Math.max(1, Number(acSeatFrom));
  if (acSeatTo !== undefined)      settings.acSeatTo      = Math.max(1, Number(acSeatTo));
  if (nonAcSeatFrom !== undefined) settings.nonAcSeatFrom = Math.max(1, Number(nonAcSeatFrom));
  if (nonAcSeatTo !== undefined)   settings.nonAcSeatTo   = Math.max(1, Number(nonAcSeatTo));
  if (acQrImage !== undefined)     settings.acQrImage     = acQrImage;
  if (nonAcQrImage !== undefined)  settings.nonAcQrImage  = nonAcQrImage;
  if (upiId !== undefined)         settings.upiId         = upiId;
  if (acPrice !== undefined)       settings.acPrice       = Math.max(0, Number(acPrice));
  if (nonAcPrice !== undefined)    settings.nonAcPrice    = Math.max(0, Number(nonAcPrice));

  // keep the ranges sane if "from" ends up above "to" after a partial update
  if (settings.acSeatFrom > settings.acSeatTo)       settings.acSeatTo    = settings.acSeatFrom;
  if (settings.nonAcSeatFrom > settings.nonAcSeatTo) settings.nonAcSeatTo = settings.nonAcSeatFrom;

  await settings.save();

  // if the AC range grew, make sure the new seats actually exist
  if (acSeatFrom !== undefined || acSeatTo !== undefined) {
    await ensureAcSeats(settings.acSeatFrom, settings.acSeatTo, settings.acPrice);
  }

  // if the Non-AC range grew, make sure the new seats actually exist
  if (nonAcSeatFrom !== undefined || nonAcSeatTo !== undefined) {
    await ensureNonAcSeats(settings.nonAcSeatFrom, settings.nonAcSeatTo, settings.nonAcPrice);
  }

  // fee customization: push the new price onto every seat of that zone so the
  // change reflects on the public booking page without touching any code
  if (acPrice !== undefined)    await Seat.updateMany({ type: 'AC' },     { $set: { price: settings.acPrice } });
  if (nonAcPrice !== undefined) await Seat.updateMany({ type: 'NON_AC' }, { $set: { price: settings.nonAcPrice } });

  const allSeats = await Seat.find().lean();
  getIO().emit('settings_updated', settings.toObject());
  getIO().emit('seats_updated', allSeats);
  res.json(settings.toObject());
});

module.exports = router;
