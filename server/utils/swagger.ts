import { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { logger } from './logger';

// Swagger options
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'REST API with role-based access, WebSocket messaging, and MongoDB integration',
    },
    servers: [
      {
        url: '/api/v1',
        description: 'API server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./server/controllers/*.ts'], // Path to the API docs
};

// Initialize swagger-jsdoc
const userSpecs = swaggerJsdoc({
  ...options,
  definition: {
    ...options.definition,
    info: {
      ...options.definition.info,
      title: 'User API Documentation',
    },
  },
});

const adminSpecs = swaggerJsdoc({
  ...options,
  definition: {
    ...options.definition,
    info: {
      ...options.definition.info,
      title: 'Admin API Documentation',
    },
  },
});

// Setup Swagger routes
export const setupSwagger = (app: Express) => {
  // User Swagger route
  app.use(
    '/api/docs/user',
    swaggerUi.serve,
    swaggerUi.setup(userSpecs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'User API Documentation',
    })
  );

  // Admin Swagger route
  app.use(
    '/api/docs/admin',
    swaggerUi.serve,
    swaggerUi.setup(adminSpecs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Admin API Documentation',
    })
  );

  logger.info('Swagger documentation setup complete');
};
