const env = require('../config/env');

/**
 * Haversine formula to compute geodesic distance between two coordinates in meters
 * @param {{ lat: number, lng: number }} a
 * @param {{ lat: number, lng: number }} b
 * @returns {number} Distance in meters
 */
const toRad = (d) => (d * Math.PI) / 180;

const distanceMeters = (a, b) => {
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
};

/**
 * Accurate Date and Time extractor in COMPANY_TZ
 */
const getCompanyDateTime = (date = new Date()) => {
  const timeZone = env.COMPANY_TZ || 'Asia/Kolkata';

  // Format 'YYYY-MM-DD'
  const formatterDate = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const dateStr = formatterDate.format(date);

  // Format 'hh:mm AM/PM'
  const formatterTime = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  const timeStr = formatterTime.format(date);

  // Numeric 24-hr hour and minute
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false
  }).formatToParts(date);

  const hour = Number(parts.find(p => p.type === 'hour')?.value || 0);
  const minute = Number(parts.find(p => p.type === 'minute')?.value || 0);

  return { dateStr, timeStr, hour, minute };
};

module.exports = {
  distanceMeters,
  getCompanyDateTime
};

