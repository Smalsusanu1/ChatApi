import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';
import { logger } from '../utils/logger';

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Client connection tracking
interface Client {
  userId: string;
  socket: WebSocket;
  groups: Set<string>;
}

const clients: Map<string, Client> = new Map();

// Message types
enum MessageType {
  DIRECT_MESSAGE = 'direct-message',
  GROUP_MESSAGE = 'group-message',
  JOIN_GROUP = 'join-group',
  LEAVE_GROUP = 'leave-group',
  ERROR = 'error'
}

// Setup WebSocket handlers
export const setupWebSocketHandlers = (wss: WebSocketServer) => {
  wss.on('connection', async (socket, request) => {
    try {
      // Get token from query parameters
      const url = new URL(request.url || '', `http://${request.headers.host}`);
      const token = url.searchParams.get('token');
      
      if (!token) {
        sendError(socket, 'Authentication token required');
        socket.close();
        return;
      }
      
      // Verify token
      let decoded: any;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (error) {
        sendError(socket, 'Invalid authentication token');
        socket.close();
        return;
      }
      
      // Get user from database
      const user = await storage.getUser(decoded.id);
      if (!user) {
        sendError(socket, 'User not found');
        socket.close();
        return;
      }
      
      // Check if user is verified
      if (!user.isVerified) {
        sendError(socket, 'Email verification required');
        socket.close();
        return;
      }
      
      // Store client connection
      const client: Client = {
        userId: user.id,
        socket,
        groups: new Set()
      };
      
      clients.set(user.id, client);
      
      logger.info(`WebSocket client connected: ${user.id} (${user.name})`);
      
      // Handle messages
      socket.on('message', async (messageData) => {
        try {
          const message = JSON.parse(messageData.toString());
          
          switch (message.type) {
            case MessageType.DIRECT_MESSAGE:
              await handleDirectMessage(client, message);
              break;
              
            case MessageType.GROUP_MESSAGE:
              await handleGroupMessage(client, message);
              break;
              
            case MessageType.JOIN_GROUP:
              await handleJoinGroup(client, message);
              break;
              
            case MessageType.LEAVE_GROUP:
              await handleLeaveGroup(client, message);
              break;
              
            default:
              sendError(socket, `Unknown message type: ${message.type}`);
          }
        } catch (error) {
          logger.error('Error handling WebSocket message:', error);
          sendError(socket, 'Error processing message');
        }
      });
      
      // Handle disconnection
      socket.on('close', () => {
        clients.delete(user.id);
        logger.info(`WebSocket client disconnected: ${user.id}`);
      });
      
    } catch (error) {
      logger.error('WebSocket connection error:', error);
      socket.close();
    }
  });
  
  logger.info('WebSocket server initialized');
};

// Handle direct message between users
async function handleDirectMessage(client: Client, message: any) {
  try {
    const { receiverId, content } = message;
    
    if (!receiverId || !content) {
      sendError(client.socket, 'receiverId and content are required');
      return;
    }
    
    // Store message in database
    const savedMessage = await storage.createMessage({
      senderId: client.userId,
      receiverId,
      content,
      groupId: null
    });
    
    // Get sender information
    const sender = await storage.getUser(client.userId);
    
    // Prepare message to send
    const outgoingMessage = {
      type: MessageType.DIRECT_MESSAGE,
      messageId: savedMessage.id,
      senderId: client.userId,
      senderName: sender?.name || 'Unknown',
      content,
      timestamp: new Date().toISOString()
    };
    
    // Send to receiver if online
    const receiver = clients.get(receiverId);
    if (receiver && receiver.socket.readyState === WebSocket.OPEN) {
      receiver.socket.send(JSON.stringify(outgoingMessage));
    }
    
    // Also send back to sender for confirmation
    client.socket.send(JSON.stringify(outgoingMessage));
    
    logger.debug(`Direct message sent from ${client.userId} to ${receiverId}`);
  } catch (error) {
    logger.error('Error handling direct message:', error);
    sendError(client.socket, 'Error sending direct message');
  }
}

// Handle group message
async function handleGroupMessage(client: Client, message: any) {
  try {
    const { groupId, content } = message;
    
    if (!groupId || !content) {
      sendError(client.socket, 'groupId and content are required');
      return;
    }
    
    // Check if group exists
    const group = await storage.getGroup(groupId);
    if (!group) {
      sendError(client.socket, 'Group not found');
      return;
    }
    
    // Check if user is a member of the group
    const isMember = await storage.isUserInGroup(client.userId, groupId);
    if (!isMember) {
      sendError(client.socket, 'You are not a member of this group');
      return;
    }
    
    // Store message in database
    const savedMessage = await storage.createMessage({
      senderId: client.userId,
      receiverId: null,
      groupId,
      content
    });
    
    // Get sender information
    const sender = await storage.getUser(client.userId);
    
    // Prepare message to send
    const outgoingMessage = {
      type: MessageType.GROUP_MESSAGE,
      messageId: savedMessage.id,
      groupId,
      senderId: client.userId,
      senderName: sender?.name || 'Unknown',
      content,
      timestamp: new Date().toISOString()
    };
    
    // Get group members and send message to all online members
    const members = await storage.getGroupMembers(groupId);
    members.forEach(member => {
      const memberClient = clients.get(member.id);
      if (memberClient && memberClient.socket.readyState === WebSocket.OPEN) {
        memberClient.socket.send(JSON.stringify(outgoingMessage));
      }
    });
    
    logger.debug(`Group message sent from ${client.userId} to group ${groupId}`);
  } catch (error) {
    logger.error('Error handling group message:', error);
    sendError(client.socket, 'Error sending group message');
  }
}

// Handle join group
async function handleJoinGroup(client: Client, message: any) {
  try {
    const { groupId } = message;
    
    if (!groupId) {
      sendError(client.socket, 'groupId is required');
      return;
    }
    
    // Check if group exists
    const group = await storage.getGroup(groupId);
    if (!group) {
      sendError(client.socket, 'Group not found');
      return;
    }
    
    // Check if user is already a member
    const isMember = await storage.isUserInGroup(client.userId, groupId);
    if (isMember) {
      sendError(client.socket, 'You are already a member of this group');
      return;
    }
    
    // Add user to group
    await storage.addUserToGroup({
      groupId,
      userId: client.userId
    });
    
    // Add group to client's joined groups
    client.groups.add(groupId);
    
    // Get user information
    const user = await storage.getUser(client.userId);
    
    // Prepare join notification
    const joinNotification = {
      type: 'group-join',
      groupId,
      userId: client.userId,
      userName: user?.name || 'Unknown',
      timestamp: new Date().toISOString()
    };
    
    // Get group members and notify all online members
    const members = await storage.getGroupMembers(groupId);
    members.forEach(member => {
      const memberClient = clients.get(member.id);
      if (memberClient && memberClient.socket.readyState === WebSocket.OPEN) {
        memberClient.socket.send(JSON.stringify(joinNotification));
      }
    });
    
    logger.debug(`User ${client.userId} joined group ${groupId}`);
  } catch (error) {
    logger.error('Error handling join group:', error);
    sendError(client.socket, 'Error joining group');
  }
}

// Handle leave group
async function handleLeaveGroup(client: Client, message: any) {
  try {
    const { groupId } = message;
    
    if (!groupId) {
      sendError(client.socket, 'groupId is required');
      return;
    }
    
    // Check if group exists
    const group = await storage.getGroup(groupId);
    if (!group) {
      sendError(client.socket, 'Group not found');
      return;
    }
    
    // Check if user is a member
    const isMember = await storage.isUserInGroup(client.userId, groupId);
    if (!isMember) {
      sendError(client.socket, 'You are not a member of this group');
      return;
    }
    
    // Remove user from group
    await storage.removeUserFromGroup(client.userId, groupId);
    
    // Remove group from client's joined groups
    client.groups.delete(groupId);
    
    // Get user information
    const user = await storage.getUser(client.userId);
    
    // Prepare leave notification
    const leaveNotification = {
      type: 'group-leave',
      groupId,
      userId: client.userId,
      userName: user?.name || 'Unknown',
      timestamp: new Date().toISOString()
    };
    
    // Get group members and notify all online members
    const members = await storage.getGroupMembers(groupId);
    members.forEach(member => {
      const memberClient = clients.get(member.id);
      if (memberClient && memberClient.socket.readyState === WebSocket.OPEN) {
        memberClient.socket.send(JSON.stringify(leaveNotification));
      }
    });
    
    logger.debug(`User ${client.userId} left group ${groupId}`);
  } catch (error) {
    logger.error('Error handling leave group:', error);
    sendError(client.socket, 'Error leaving group');
  }
}

// Send error message
function sendError(socket: WebSocket, message: string) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: MessageType.ERROR,
      message
    }));
  }
}
