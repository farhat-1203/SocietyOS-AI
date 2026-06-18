import cors from 'cors';
import env from '@config/env';

/**
 * CORS configuration
 * Allows requests from frontend and specified origins
 */
export const corsConfig = cors({
  origin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Society-Id'],
  exposedHeaders: ['X-Request-ID', 'X-Total-Count'],
  maxAge: 86400, // 24 hours
});

export default corsConfig;
