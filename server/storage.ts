import { 
  User, InsertUser, 
  Message, InsertMessage, 
  Group, InsertGroup, 
  GroupMember, InsertGroupMember 
} from "@shared/schema";
import mongoose from 'mongoose';
import UserModel from './models/user.model';
import MessageModel from './models/message.model';
import GroupModel from './models/group.model';
import { logger } from './utils/logger';

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserByVerificationToken(token: string): Promise<User | null>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | null>;
  listUsers(page?: number, limit?: number): Promise<{ users: User[], total: number }>;
  
  // Admin operations
  createAdmin(admin: InsertUser): Promise<User>;
  listAdmins(): Promise<User[]>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBetweenUsers(senderId: string, receiverId: string): Promise<Message[]>;
  getGroupMessages(groupId: string): Promise<Message[]>;
  
  // Group operations
  createGroup(group: InsertGroup): Promise<Group>;
  getGroup(id: string): Promise<Group | null>;
  listGroups(): Promise<Group[]>;
  
  // Group membership operations
  addUserToGroup(groupMember: InsertGroupMember): Promise<GroupMember>;
  removeUserFromGroup(userId: string, groupId: string): Promise<boolean>;
  getGroupMembers(groupId: string): Promise<User[]>;
  getUserGroups(userId: string): Promise<Group[]>;
  isUserInGroup(userId: string, groupId: string): Promise<boolean>;
  
  // Initialize database connection
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

export class MongoDBStorage implements IStorage {
  constructor() {}

  async connect(): Promise<void> {
    try {
      if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not defined');
      }
      
      await mongoose.connect(process.env.MONGODB_URI);
      logger.info('Connected to MongoDB');
    } catch (error) {
      logger.error('MongoDB connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }

  // User operations
  async getUser(id: string): Promise<User | null> {
    try {
      const user = await UserModel.findById(id).select('-password');
      return user ? user.toObject() : null;
    } catch (error) {
      logger.error('Error getting user:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await UserModel.findOne({ email });
      return user ? user.toObject() : null;
    } catch (error) {
      logger.error('Error getting user by email:', error);
      throw error;
    }
  }

  async getUserByVerificationToken(token: string): Promise<User | null> {
    try {
      const user = await UserModel.findOne({ verificationToken: token });
      return user ? user.toObject() : null;
    } catch (error) {
      logger.error('Error getting user by verification token:', error);
      throw error;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    try {
      const user = new UserModel(userData);
      await user.save();
      return user.toObject();
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      const user = await UserModel.findByIdAndUpdate(id, updates, { new: true });
      return user ? user.toObject() : null;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  async listUsers(page = 1, limit = 10): Promise<{ users: User[], total: number }> {
    try {
      const skip = (page - 1) * limit;
      const users = await UserModel.find({ role: 'user' })
        .select('-password')
        .skip(skip)
        .limit(limit);
        
      const total = await UserModel.countDocuments({ role: 'user' });
      
      return {
        users: users.map(user => user.toObject()),
        total
      };
    } catch (error) {
      logger.error('Error listing users:', error);
      throw error;
    }
  }

  // Admin operations
  async createAdmin(adminData: InsertUser): Promise<User> {
    try {
      const adminWithRole = { ...adminData, role: 'admin' };
      const admin = new UserModel(adminWithRole);
      await admin.save();
      return admin.toObject();
    } catch (error) {
      logger.error('Error creating admin:', error);
      throw error;
    }
  }

  async listAdmins(): Promise<User[]> {
    try {
      const admins = await UserModel.find({ role: 'admin' }).select('-password');
      return admins.map(admin => admin.toObject());
    } catch (error) {
      logger.error('Error listing admins:', error);
      throw error;
    }
  }

  // Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    try {
      const message = new MessageModel(messageData);
      await message.save();
      return message.toObject();
    } catch (error) {
      logger.error('Error creating message:', error);
      throw error;
    }
  }

  async getMessagesBetweenUsers(senderId: string, receiverId: string): Promise<Message[]> {
    try {
      const messages = await MessageModel.find({
        $or: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      }).sort({ createdAt: 1 });
      
      return messages.map(message => message.toObject());
    } catch (error) {
      logger.error('Error getting messages between users:', error);
      throw error;
    }
  }

  async getGroupMessages(groupId: string): Promise<Message[]> {
    try {
      const messages = await MessageModel.find({ groupId })
        .sort({ createdAt: 1 })
        .populate('senderId', 'name');
        
      return messages.map(message => message.toObject());
    } catch (error) {
      logger.error('Error getting group messages:', error);
      throw error;
    }
  }

  // Group operations
  async createGroup(groupData: InsertGroup): Promise<Group> {
    try {
      const group = new GroupModel(groupData);
      await group.save();
      return group.toObject();
    } catch (error) {
      logger.error('Error creating group:', error);
      throw error;
    }
  }

  async getGroup(id: string): Promise<Group | null> {
    try {
      const group = await GroupModel.findById(id);
      return group ? group.toObject() : null;
    } catch (error) {
      logger.error('Error getting group:', error);
      throw error;
    }
  }

  async listGroups(): Promise<Group[]> {
    try {
      const groups = await GroupModel.find();
      return groups.map(group => group.toObject());
    } catch (error) {
      logger.error('Error listing groups:', error);
      throw error;
    }
  }

  // Group membership operations
  async addUserToGroup(groupMember: InsertGroupMember): Promise<GroupMember> {
    try {
      const group = await GroupModel.findById(groupMember.groupId);
      if (!group) {
        throw new Error('Group not found');
      }
      
      // Add user to group members array if not already a member
      if (!group.members.includes(groupMember.userId)) {
        group.members.push(groupMember.userId);
        await group.save();
      }
      
      return {
        id: Math.floor(Math.random() * 1000), // Placeholder for the ID
        groupId: groupMember.groupId,
        userId: groupMember.userId,
        joinedAt: new Date()
      };
    } catch (error) {
      logger.error('Error adding user to group:', error);
      throw error;
    }
  }

  async removeUserFromGroup(userId: string, groupId: string): Promise<boolean> {
    try {
      const group = await GroupModel.findById(groupId);
      if (!group) {
        throw new Error('Group not found');
      }
      
      // Remove user from group members array
      const index = group.members.indexOf(userId);
      if (index > -1) {
        group.members.splice(index, 1);
        await group.save();
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Error removing user from group:', error);
      throw error;
    }
  }

  async getGroupMembers(groupId: string): Promise<User[]> {
    try {
      const group = await GroupModel.findById(groupId).populate('members', '-password');
      if (!group) {
        throw new Error('Group not found');
      }
      
      return group.members.map((member: any) => member.toObject());
    } catch (error) {
      logger.error('Error getting group members:', error);
      throw error;
    }
  }

  async getUserGroups(userId: string): Promise<Group[]> {
    try {
      const groups = await GroupModel.find({ members: userId });
      return groups.map(group => group.toObject());
    } catch (error) {
      logger.error('Error getting user groups:', error);
      throw error;
    }
  }

  async isUserInGroup(userId: string, groupId: string): Promise<boolean> {
    try {
      const group = await GroupModel.findById(groupId);
      if (!group) {
        return false;
      }
      
      return group.members.includes(userId);
    } catch (error) {
      logger.error('Error checking if user is in group:', error);
      throw error;
    }
  }
}

// Initialize and export the storage
const storage = new MongoDBStorage();
export { storage };
