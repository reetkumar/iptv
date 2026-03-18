// Security headers and CSP configuration
export const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https:",
    "frame-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

// CORS configuration
export const corsConfig = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://reetlivetv.netlify.app']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 3600,
};

// Environment variable validation
export const validateEnvironment = (): void => {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
  ];

  const missing = requiredVars.filter((v) => !import.meta.env[v]);
  
  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
  }
};

// Secure token storage
export const secureTokenStorage = {
  setToken: (key: string, token: string): void => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(key, token);
    }
  },

  getToken: (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(key);
    }
    return null;
  },

  removeToken: (key: string): void => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(key);
    }
  },

  clearAllTokens: (): void => {
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }
  },
};

// HTTPS enforcement
export const enforceHTTPS = (): void => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isLocalNetwork =
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);

  if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && !window.location.hostname.includes('localhost') && !isLocalNetwork) {
    window.location.protocol = 'https:';
  }
};

// Audit logging
export const auditLog = (
  action: string,
  details: Record<string, unknown>,
  severity: 'low' | 'medium' | 'high' = 'low'
): void => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    severity,
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...details,
  };

  console.log('[AUDIT]', logEntry);

  // TODO: Send to audit logging service
};
