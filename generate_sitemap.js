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
  '/refund-policy',
  '/founder',
  '/faq',
  '/disclaimer',
  '/careers',
  '/press',
  '/guides',
  '/guides/best-phones-under-20000',
  '/guides/best-laptops-under-50000',
  '/guides/best-gaming-headphones',
  '/guides/best-smart-tvs',
  '/guides/best-washing-machines',
  '/guides/best-air-conditioners',
  '/guides/best-refrigerators',
  '/guides/best-power-banks'
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

// Also write to dist/ if it exists so production build artifacts have them
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  fs.writeFileSync(path.join(distPath, 'sitemap.xml'), sitemap);
  fs.writeFileSync(path.join(distPath, 'robots.txt'), robotsTxt);
}

console.log('Sitemap and robots.txt generated successfully!');
