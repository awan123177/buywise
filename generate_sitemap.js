import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pages = [
  '',
  '/radar',
  '/travel',
  '/premium',
  '/deals',
  '/rewards',
  '/scanner',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/founder',
  '/faq',
  '/disclaimer',
  '/careers',
  '/press'
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>https://buywiser.store${page}</loc>
    <changefreq>daily</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://buywiser.store/sitemap.xml`;

fs.writeFileSync(path.join(__dirname, 'public', 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(__dirname, 'public', 'robots.txt'), robotsTxt);

console.log('Sitemap and robots.txt generated successfully!');
