import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { isAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createAdminSchema } from '@shared/schema';
import { logger } from '../utils/logger';

const router = Router();

// Apply admin check middleware to all routes
router.use(isAdmin);

/**
 * @swagger
 * /admin/admins:
 *   post:
 *     summary: Create a new admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - firstName
 *               - email
 *               - country
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               firstName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               country:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: Email already exists
 */
router.post('/admins', validate(createAdminSchema), async (req: Request, res: Response) => {
  try {
    const { name, firstName, email, country, password } = req.body;
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    
    // Create new admin
    const admin = await storage.createAdmin({
      name,
      firstName,
      email,
      country,
      password,
      role: 'admin',
      isVerified: true, // Admins are automatically verified
      verificationToken: null
    });
    
    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      adminId: admin.id
    });
  } catch (error) {
    logger.error('Create admin error:', error);
    res.status(500).json({ message: 'Error creating admin' });
  }
});

/**
 * @swagger
 * /admin/admins:
 *   get:
 *     summary: List all admins
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of admins
 */
router.get('/admins', async (req: Request, res: Response) => {
  try {
    const admins = await storage.listAdmins();
    
    res.json({
      success: true,
      admins,
      total: admins.length
    });
  } catch (error) {
    logger.error('List admins error:', error);
    res.status(500).json({ message: 'Error retrieving admins' });
  }
});

/**
 * @swagger
 * /admin/logs:
 *   get:
 *     summary: View system logs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [info, warn, error]
 *         description: Log level filter
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for logs
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for logs
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Logs per page
 *     responses:
 *       200:
 *         description: System logs
 */
router.get('/logs', async (req: Request, res: Response) => {
  try {
    // This is a placeholder as actual log retrieval would require a proper implementation
    // In a real system, you would read logs from files or database
    
    res.json({
      success: true,
      logs: [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'System running normally',
          metadata: {}
        }
      ],
      total: 1,
      pages: 1
    });
  } catch (error) {
    logger.error('Get logs error:', error);
    res.status(500).json({ message: 'Error retrieving logs' });
  }
});

export const adminRouter = router;
