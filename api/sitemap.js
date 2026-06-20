// api/sitemap.js — Vercel Serverless Function
// Generates a dynamic sitemap.xml by fetching live tours & hotels from Supabase

const SUPABASE_URL = 'https://qlrywjibzbvqbldccczz.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.' +
  'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscnl3amliemJ2cWJsZGNjY3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2ODgwMzksImV4cCI6MjA5NzI2NDAzOX0' +
  '.' +
  'fZdWP6ccdEAurGK2wq7tpokVLQOo_EVA71II1W_fAMo';

// Fetch a Supabase table and return the unwrapped data array
async function fetchTable(table) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=data`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) return [];
    const rows = await res.json();
    return Array.isArray(rows) ? rows.map(r => r.data).filter(Boolean) : [];
  } catch {
    return [];
  }
}

// Read the site URL from system_config > settings
async function fetchSiteUrl() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/system_config?select=value&key=eq.settings`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    const settings = rows?.[0]?.value;
    return settings?.websiteUrl || settings?.siteUrl || null;
  } catch {
    return null;
  }
}

function xmlEscape(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function url(loc, changefreq = 'weekly', priority = '0.7', lastmod = null) {
  const today = lastmod || new Date().toISOString().split('T')[0];
  return `  <url>
    <loc>${xmlEscape(loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export default async function handler(req, res) {
  // Determine base URL: prefer request host, fall back to settings or default
  let base = `https://${req.headers.host}`;
  // Remove trailing slash
  base = base.replace(/\/$/, '');

  const today = new Date().toISOString().split('T')[0];

  // Fetch dynamic data in parallel
  const [tours, hotels, destinations] = await Promise.all([
    fetchTable('tours'),
    fetchTable('hotels'),
    fetchTable('destinations'),
  ]);

  // ── Static pages ──────────────────────────────────────────────────────────
  const staticUrls = [
    url(`${base}/`, 'weekly', '1.0', today),
    url(`${base}/tours`, 'daily', '0.9', today),
    url(`${base}/destinations`, 'weekly', '0.85', today),
    url(`${base}/hotels`, 'weekly', '0.85', today),
    url(`${base}/cars`, 'weekly', '0.75', today),
    url(`${base}/blog`, 'daily', '0.75', today),
    url(`${base}/about`, 'monthly', '0.6', today),
    url(`${base}/contact`, 'monthly', '0.65', today),
    url(`${base}/privacy`, 'yearly', '0.3', today),
    url(`${base}/terms`, 'yearly', '0.3', today),
    url(`${base}/sitemap`, 'monthly', '0.2', today),
  ];

  // ── Dynamic tour pages ────────────────────────────────────────────────────
  const tourUrls = tours
    .filter(t => t && t.active !== false)
    .map(t => {
      const loc = t.slug
        ? `${base}/tours/${xmlEscape(t.slug)}`
        : `${base}/tour-detail.html?id=${t.id}`;
      return url(loc, 'weekly', '0.85', today);
    });

  // ── Dynamic hotel pages ───────────────────────────────────────────────────
  const hotelUrls = hotels
    .filter(h => h && h.active !== false)
    .map(h => url(`${base}/hotel-detail.html?id=${h.id}`, 'weekly', '0.75', today));

  // ── Dynamic destination pages ─────────────────────────────────────────────
  const destUrls = destinations
    .filter(d => d && d.active !== false)
    .map(d => url(`${base}/destinations?id=${d.id}`, 'monthly', '0.7', today));

  const allUrls = [...staticUrls, ...tourUrls, ...hotelUrls, ...destUrls].join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allUrls}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(xml);
}
