import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  type?: string;
  image?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title = "BuyWise - AI-Powered Shopping & Travel Comparison", 
  description = "BuyWise uses AI to find you the real lowest prices across shopping and travel. Smart comparisons, affiliate deals, and intelligent recommendations.", 
  canonicalUrl = "https://buywiser.store",
  type = "website",
  image = "https://buywiser.store/icon.png"
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://buywiser.store/#website",
        "url": "https://buywiser.store/",
        "name": "BuyWise",
        "description": "AI-powered shopping and travel comparison platform.",
        "potentialAction": [{
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://buywiser.store/search?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }]
      },
      {
        "@type": "Organization",
        "@id": "https://buywiser.store/#organization",
        "name": "BuyWise",
        "url": "https://buywiser.store/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://buywiser.store/icon.png"
        },
        "founder": {
          "@type": "Person",
          "name": "Awan Warsi",
          "jobTitle": "Founder, Owner, CEO & Chairman"
        },
        "brand": {
          "@type": "Brand",
          "name": "BuyWise"
        }
      }
    ]
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;
