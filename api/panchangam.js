// api/panchangam.js
const { getPanchangam, Observer } = require('@ishubhamx/panchangam-js');
const { DateTime } = require('luxon');

module.exports = async (req, res) => {
  try {
    // CORS for embedding/fetching from your website
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    const q = req.query || {};
    const dateParam = q.date || q.d || null;
    const city = q.city || null;
    let lat = parseFloat(q.lat ?? q.latitude ?? 28.6139);
    let lon = parseFloat(q.lon ?? q.longitude ?? 77.2090);
    let elev = parseFloat(q.elev ?? q.alt ?? 0);
    let timeZone = q.tz || q.timezone || 'Asia/Kolkata';

    // city map with timezone info (DST-aware via luxon)
    const cityMap = {
      delhi: { lat: 28.6139, lon: 77.2090, tz: 'Asia/Kolkata' },
      newyork: { lat: 40.7128, lon: -74.006, tz: 'America/New_York' },
      london: { lat: 51.5072, lon: -0.1276, tz: 'Europe/London' },
      sydney: { lat: -33.8688, lon: 151.2093, tz: 'Australia/Sydney' },
      dubai: { lat: 25.276987, lon: 55.296249, tz: 'Asia/Dubai' }
    };

    if (city && cityMap[city.toLowerCase()]) {
      const c = cityMap[city.toLowerCase()];
      lat = c.lat; lon = c.lon; timeZone = c.tz;
    }

    const now = DateTime.now().setZone(timeZone);
    const date = dateParam ? DateTime.fromISO(dateParam, { zone: timeZone }) : now;

    if (!date.isValid) {
      return res.status(400).json({ error: 'Invalid date. Use ISO like 2025-10-16' });
    }

    const observer = new Observer(lat, lon, elev);
    const panchangam = getPanchangam(date.toJSDate(), observer);

    const response = {
      meta: {
        requestedAt: now.toISO(),
        date: date.toISODate(),
        city: city || 'custom',
        location: { lat, lon, elev },
        timeZone,
        isDST: now.isInDST
      },
      panchangam: {
        tithi: panchangam.tithi,
        tithi_name: panchangam.tithiName || null,
        nakshatra: panchangam.nakshatra,
        nakshatra_name: panchangam.nakshatraName || null,
        yoga: panchangam.yoga,
        yoga_name: panchangam.yogaName || null,
        karana: panchangam.karana,
        vara: panchangam.vara,
        sunrise: panchangam.sunrise ? panchangam.sunrise.toISOString() : null,
        sunset: panchangam.sunset ? panchangam.sunset.toISOString() : null,
        moonrise: panchangam.moonrise ? panchangam.moonrise.toISOString() : null,
        moonset: panchangam.moonset ? panchangam.moonset.toISOString() : null,
        rahu_kalam: {
          start: panchangam.rahuKalamStart ? panchangam.rahuKalamStart.toISOString() : null,
          end: panchangam.rahuKalamEnd ? panchangam.rahuKalamEnd.toISOString() : null
        }
      }
    };

    // Cache on CDN for 15 minutes
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
    return res.status(200).json(response);
  } catch (err) {
    console.error('Panchang error', err);
    return res.status(500).json({ error: String(err) });
  }
};
