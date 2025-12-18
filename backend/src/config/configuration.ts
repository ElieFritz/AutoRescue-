export default () => ({
  // Application
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiPrefix: process.env.API_PREFIX || 'api',
  apiVersion: process.env.API_VERSION || 'v1',

  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },

  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // NotchPay
  notchpay: {
    publicKey: process.env.NOTCHPAY_PUBLIC_KEY,
    secretKey: process.env.NOTCHPAY_SECRET_KEY,
    webhookSecret: process.env.NOTCHPAY_WEBHOOK_SECRET,
    apiUrl: process.env.NOTCHPAY_API_URL || 'https://api.notchpay.co',
  },

  // Mapbox
  mapbox: {
    accessToken: process.env.MAPBOX_ACCESS_TOKEN,
  },

  // Rate limiting
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'debug',
});
