// api/robots.js — Vercel Serverless Function
// Generates robots.txt dynamically pointing search engines to your sitemap

export default function handler(req, res) {
  const base = `https://${req.headers.host}`.replace(/\/$/, '');

  const txt = `User-agent: *
Allow: /

# Disallow admin dashboard
Disallow: /admin-dash/

# Sitemap
Sitemap: ${base}/sitemap.xml
`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=86400');
  res.status(200).send(txt);
}
