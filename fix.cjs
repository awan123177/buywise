const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /\/\/ Vite middleware for development[\s\S]*?\}\);/m;

code = code.replace(/\/\/ Vite middleware for development[\s\S]*?app\.use\(vite\.middlewares\);\s*\}\s*else\s*\{\s*\/\/\s*Production serving[\s\S]*?\}\);[\s\S]*?\}\s*catch\s*\(e\)\s*\{\s*res\.status\(500\)\.end\(e\.message\);\s*\}\s*\}\);\s*app\.use\(vite\.middlewares\);\s*\}\s*else\s*\{\s*\/\/\s*Production serving[\s\S]*?res\.sendFile\(path\.join\(distPath, "index\.html"\)\);\s*\}\);\s*\}/, 
`// Vite middleware for development
  let vite;
  if (process.env.NODE_ENV !== "production") {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
  } else {
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
  });`);

fs.writeFileSync('server.ts', code, 'utf-8');
