import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { isVerified } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { insertGroupSchema } from '@shared/schema';
import { logger } from '../utils/logger';

const router = Router();

// Require email verification for all group routes
router.use(isVerified);

/**
 * @swagger
 * /groups:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Group created successfully
 *       400:
 *         description: Invalid input data
 */
router.post('/', validate(insertGroupSchema), async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    
    // Create new group
    const group = await storage.createGroup({
      name,
      description
    });
    
    // Add creator as first member
    await storage.addUserToGroup({
      groupId: group.id,
      userId: req.user.id
    });
    
    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      group
    });
  } catch (error) {
    logger.error('Create group error:', error);
    res.status(500).json({ message: 'Error creating group' });
  }
});

/**
 * @swagger
 * /groups:
 *   get:
 *     summary: Get all groups
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of groups
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const groups = await storage.listGroups();
    
    res.json({
      success: true,
      groups
    });
  } catch (error) {
    logger.error('List groups error:', error);
    res.status(500).json({ message: 'Error retrieving groups' });
  }
});

/**
 * @swagger
 * /groups/{id}:
 *   get:
 *     summary: Get group by ID
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Group details
 *       404:
 *         description: Group not found
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const group = await storage.getGroup(id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    res.json({
      success: true,
      group
    });
  } catch (error) {
    logger.error(`Error getting group ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error retrieving group' });
  }
});

/**
 * @swagger
 * /groups/{id}/members:
 *   get:
 *     summary: Get group members
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of group members
 *       404:
 *         description: Group not found
 */
router.get('/:id/members', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const group = await storage.getGroup(id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    const members = await storage.getGroupMembers(id);
    
    res.json({
      success: true,
      members
    });
  } catch (error) {
    logger.error(`Error getting group members for ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error retrieving group members' });
  }
});

/**
 * @swagger
 * /groups/{id}/join:
 *   post:
 *     summary: Join a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully joined group
 *       404:
 *         description: Group not found
 */
router.post('/:id/join', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if group exists
    const group = await storage.getGroup(id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is already a member
    const isMember = await storage.isUserInGroup(userId, id);
    if (isMember) {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }
    
    // Add user to group
    await storage.addUserToGroup({
      groupId: id,
      userId
    });
    
    res.json({
      success: true,
      message: 'Successfully joined group'
    });
  } catch (error) {
    logger.error(`Error joining group ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error joining group' });
  }
});

/**
 * @swagger
 * /groups/{id}/leave:
 *   post:
 *     summary: Leave a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully left group
 *       404:
 *         description: Group not found
 */
router.post('/:id/leave', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if group exists
    const group = await storage.getGroup(id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is a member
    const isMember = await storage.isUserInGroup(userId, id);
    if (!isMember) {
      return res.status(400).json({ message: 'You are not a member of this group' });
    }
    
    // Remove user from group
    await storage.removeUserFromGroup(userId, id);
    
    res.json({
      success: true,
      message: 'Successfully left group'
    });
  } catch (error) {
    logger.error(`Error leaving group ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error leaving group' });
  }
});

export const groupRouter = router;
