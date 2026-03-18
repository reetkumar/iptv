/**
 * Structured Data (JSON-LD) generators for SEO
 */

export interface SchemaConfig {
  type: string;
  [key: string]: string | number | boolean | object | undefined;
}

/**
 * Generate Organization schema for brand identity
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'REET TV',
    url: window.location.origin,
    logo: `${window.location.origin}/favicon.svg`,
    description: 'Premium IPTV streaming service with live TV channels',
    sameAs: [
      'https://twitter.com/reetmeena',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@reettv.com',
    },
  };
}

/**
 * Generate WebSite schema for site-wide SEO
 */
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'REET TV',
    url: window.location.origin,
    description: 'Premium IPTV streaming service offering live TV channels, on-demand content, and personalized recommendations',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${window.location.origin}?search={search_term_string}`,
      },
      query_input: 'required name=search_term_string',
    },
  };
}

/**
 * Generate VideoObject schema for video content
 */
export function generateVideoSchema(config: {
  name: string;
  description: string;
  thumbnailUrl?: string;
  uploadDate?: string;
  duration?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: config.name,
    description: config.description,
    thumbnailUrl: config.thumbnailUrl || `${window.location.origin}/placeholder.svg`,
    uploadDate: config.uploadDate || new Date().toISOString(),
    duration: config.duration || 'PT1H',
  };
}

/**
 * Generate BreadcrumbList schema for navigation
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url?: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url || window.location.href,
    })),
  };
}

/**
 * Generate Application schema for the app
 */
export function generateApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'REET TV',
    applicationCategory: 'MultimediaApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '2500',
    },
    url: window.location.origin,
    screenshot: `${window.location.origin}/screenshot.png`,
  };
}

/**
 * Inject schema markup into the document head
 */
export function injectSchema(schema: SchemaConfig) {
  const schemaType = String(schema['@type'] ?? '');
  
  const existingScript = document.querySelector(`script[data-schema-type="${schemaType}"]`);
  if (existingScript) {
    existingScript.remove();
  }

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-schema-type', schemaType);
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

/**
 * Hook to inject multiple schemas on mount
 */
import { useEffect } from 'react';

export function useSchemaMarkup(schemas: SchemaConfig[]) {
  useEffect(() => {
    schemas.forEach(schema => injectSchema(schema));

    return () => {
      schemas.forEach(schema => {
        const script = document.querySelector(`script[data-schema-type="${schema['@type']}"]`);
        if (script) {
          script.remove();
        }
      });
    };
  }, [schemas]);
}
