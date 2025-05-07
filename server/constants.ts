// API paths
export const API_PATHS = {
  AUTH: {
    REGISTER: '/api/v1/auth/register',
    LOGIN: '/api/v1/auth/login',
    VERIFY: '/api/v1/auth/verify',
  },
  USERS: {
    BASE: '/api/v1/users',
    BY_ID: (id: string) => `/api/v1/users/${id}`,
    PROFILE: '/api/v1/users/profile/me',
  },
  MESSAGES: {
    WITH_USER: (userId: string) => `/api/v1/messages/${userId}`,
    IN_GROUP: (groupId: string) => `/api/v1/messages/groups/${groupId}`,
  },
  GROUPS: {
    BASE: '/api/v1/groups',
    BY_ID: (id: string) => `/api/v1/groups/${id}`,
    MEMBERS: (id: string) => `/api/v1/groups/${id}/members`,
    JOIN: (id: string) => `/api/v1/groups/${id}/join`,
    LEAVE: (id: string) => `/api/v1/groups/${id}/leave`,
  },
  ADMIN: {
    ADMINS: '/api/v1/admin/admins',
    LOGS: '/api/v1/admin/logs',
  },
  DOCS: {
    USER: '/api/docs/user',
    ADMIN: '/api/docs/admin',
  },
};

// WebSocket message types
export const WS_MESSAGE_TYPES = {
  DIRECT_MESSAGE: 'direct-message',
  GROUP_MESSAGE: 'group-message',
  JOIN_GROUP: 'join-group',
  LEAVE_GROUP: 'leave-group',
  GROUP_JOIN: 'group-join',
  GROUP_LEAVE: 'group-leave',
  ERROR: 'error',
};

// Role types
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

// Default values
export const DEFAULTS = {
  PAGINATION: {
    PAGE: 1,
    LIMIT: 10,
  },
};
