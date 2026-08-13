const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const structuredData = `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "BuyWise",
      "url": "https://buywiser.store",
      "founder": {
        "@type": "Person",
        "name": "Awan Warsi",
        "jobTitle": "Founder",
        "url": "https://buywiser.store"
      }
    }
    </script>
`;

if (!html.includes('application/ld+json')) {
  html = html.replace('</head>', structuredData + '</head>');
  fs.writeFileSync('index.html', html);
}
