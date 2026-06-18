import type { Express, Response } from 'express';
import express from 'express';
import { corsConfig } from '@middleware/cors';
import requestIdMiddleware from '@middleware/requestId';
import loggingMiddleware from '@middleware/logging';
import { errorMiddleware, notFoundMiddleware } from '@middleware/error';
import { sendSuccess } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';

/**
 * Create and configure Express application
 */
export const createApp = (): Express => {
  const app = express();

  // ========================================
  // Global Middleware
  // ========================================

  // CORS
  app.use(corsConfig);

  // Request ID
  app.use(requestIdMiddleware);

  // Logging
  app.use(loggingMiddleware);

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // ========================================
  // Health Check
  // ========================================

  app.get(
    '/api/health',
    asyncHandler(async (_req: any, res: Response): Promise<Response> => {
      const uptime = process.uptime();
      const timestamp = new Date().toISOString();
      const memoryUsage = process.memoryUsage();

      return sendSuccess(res, {
        status: 'healthy',
        uptime,
        timestamp,
        environment: process.env.NODE_ENV,
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        },
      });
    })
  );

  // ========================================
  // Feature Routes
  // ========================================

  // Example route structure (to be replaced with actual feature routes)
  app.get(
    '/api',
    asyncHandler(async (_req: any, res: Response): Promise<Response> => {
      return sendSuccess(res, {
        message: 'SocietyOS API v1',
        version: '1.0.0',
        endpoints: {
          health: '/api/health',
          auth: '/api/auth',
          users: '/api/users',
          rbac: '/api/rbac',
          complaints: '/api/complaints',
          dashboard: '/api/dashboard',
          notifications: '/api/notifications',
          facilities: '/api/facilities',
          notices: '/api/notices',
        },
      });
    })
  );

  // Feature routes (async pattern with proper handling)
  Promise.all([
    import('@features/auth/auth.routes').then((m) => m.default),
    import('@features/users/user.routes').then((m) => m.default),
    import('@features/rbac/rbac.routes').then((m) => m.default),
    import('@features/complaints/complaint.routes').then((m) => m.default),
    import('./modules/dashboard/dashboard.routes').then((m) => m.default),
    import('./modules/notifications/notification.routes').then((m) => m.default),
    import('./modules/facilities/facility.routes').then((m) => m.default),
    import('./modules/notices/notice.routes').then((m) => m.default),
    import('./modules/knowledge-base/knowledgeBase.routes').then((m) => m.default),
    import('./modules/vendors/vendor.routes').then((m) => m.default),
  ])
    .then(
      ([authRoutes, userRoutes, rbacRoutes, complaintRoutes, dashboardRoutes, notificationRoutes, facilityRoutes, noticeRoutes, knowledgeBaseRoutes, vendorRoutes]): void => {
        app.use('/api/auth', authRoutes);
        app.use('/api/users', userRoutes);
        app.use('/api/rbac', rbacRoutes);
        app.use('/api/complaints', complaintRoutes);
        app.use('/api/dashboard', dashboardRoutes);
        app.use('/api/notifications', notificationRoutes);
        app.use('/api/facilities', facilityRoutes);
        app.use('/api/notices', noticeRoutes);
        app.use('/api/knowledge-base', knowledgeBaseRoutes);
        app.use('/api/vendors', vendorRoutes);
      }
    )
    .catch((err): void => {
      console.error('Failed to load routes:', err);
    });

  // Additional features will be added here
  // app.use('/api/facilities', facilitiesRoutes);

  // ========================================
  // Error Handling
  // ========================================

  // 404 handler (must be before error handler)
  app.use(notFoundMiddleware);

  // Error handler (must be last)
  app.use(errorMiddleware);

  return app;
};

export default createApp;
