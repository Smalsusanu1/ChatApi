import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupSwagger } from "./utils/swagger";
import { authRouter } from "./controllers/auth.controller";
import { userRouter } from "./controllers/user.controller";
import { adminRouter } from "./controllers/admin.controller";
import { messageRouter } from "./controllers/message.controller";
import { groupRouter } from "./controllers/group.controller";
import { authMiddleware } from "./middleware/auth.middleware";
import { setupWebSocketHandlers } from "./websocket";
import { applyRateLimits } from "./middleware/rate-limit.middleware";
import { logger } from "./utils/logger";

// Connect to database
(async () => {
  try {
    await storage.connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    process.exit(1);
  }
})();

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Apply rate limits
  applyRateLimits(app);
  
  // Setup Swagger API documentation
  setupSwagger(app);
  
  // API routes with /api prefix
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/users', authMiddleware, userRouter);
  app.use('/api/v1/messages', authMiddleware, messageRouter);
  app.use('/api/v1/groups', authMiddleware, groupRouter);
  app.use('/api/v1/admin', authMiddleware, adminRouter);
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API is running' });
  });
  
  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  setupWebSocketHandlers(wss);
  
  // Default error handler
  app.use((err: any, req: any, res: any, next: any) => {
    logger.error('Unhandled error:', err);
    res.status(err.status || 500).json({
      error: {
        message: err.message || 'Internal server error',
        status: err.status || 500
      }
    });
  });

  return httpServer;
}
