import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { isVerified } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { insertMessageSchema } from '@shared/schema';
import { logger } from '../utils/logger';

const router = Router();

// Require email verification for all message routes
router.use(isVerified);

/**
 * @swagger
 * /messages/{userId}:
 *   get:
 *     summary: Get messages with a specific user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages
 *       404:
 *         description: User not found
 */
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    
    // Verify the other user exists
    const otherUser = await storage.getUser(userId);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get messages between users
    const messages = await storage.getMessagesBetweenUsers(currentUserId, userId);
    
    res.json({
      success: true,
      messages
    });
  } catch (error) {
    logger.error('Get messages error:', error);
    res.status(500).json({ message: 'Error retrieving messages' });
  }
});

/**
 * @swagger
 * /messages/groups/{groupId}:
 *   get:
 *     summary: Get messages in a specific group
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of group messages
 *       403:
 *         description: Not a member of the group
 *       404:
 *         description: Group not found
 */
router.get('/groups/:groupId', async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const currentUserId = req.user.id;
    
    // Verify the group exists
    const group = await storage.getGroup(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is a member of the group
    const isMember = await storage.isUserInGroup(currentUserId, groupId);
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }
    
    // Get group messages
    const messages = await storage.getGroupMessages(groupId);
    
    res.json({
      success: true,
      messages
    });
  } catch (error) {
    logger.error('Get group messages error:', error);
    res.status(500).json({ message: 'Error retrieving group messages' });
  }
});

export const messageRouter = router;
