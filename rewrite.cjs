const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /\/\/ SEO & 404 Middleware for SPA[\s\S]*?app\.use\(\(req, res, next\) => \{[\s\S]*?\}\);\s*\/\/ Vite middleware for development\s*if \(process\.env\.NODE_ENV !== "production"\) \{[\s\S]*?\}\);/m;

const replacement = `// Vite middleware for development
  let vite;
  if (process.env.NODE_ENV !== "production") {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
  }

  app.get("*", async (req, res) => {
    const url = req.path;
    const validPrefixes = [
      '/radar', '/travel', '/premium', '/gifts', '/deals', '/rewards', '/scanner',
      '/compare', '/wishlist', '/guides', '/hub', '/product', '/ref', '/personal-shopper', '/admin'
    ];
    const validStaticPages = [
      '/', '/about', '/contact', '/privacy', '/terms', '/refund-policy', '/faq', '/disclaimer',
      '/careers', '/press', '/founder', '/owner'
    ];

    let isValid = false;
    if (validStaticPages.includes(url)) isValid = true;
    else if (validPrefixes.some(prefix => url === prefix || url.startsWith(prefix + '/'))) isValid = true;

    if (!isValid) {
      res.status(404);
    }

    try {
      if (process.env.NODE_ENV !== "production") {
        let template = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.set('Content-Type', 'text/html').end(template);
      } else {
        res.sendFile(path.join(process.cwd(), "dist", "index.html"));
      }
    } catch (e) {
      res.status(500).end(e.message);
    }
  });`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code, 'utf-8');
console.log('done rewriting');
