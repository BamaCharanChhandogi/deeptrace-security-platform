const { z } = require('zod');

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  email: z.string().email('Invalid email address format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['ADMIN', 'MANAGER', 'USER']).default('USER')
});

const updateUserSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'USER']).optional(),
  is_active: z.boolean().optional(),
  password: z.string().min(8).optional()
});

const listUsersQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('15'),
  role: z.enum(['ADMIN', 'MANAGER', 'USER']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['created_at', 'name', 'email', 'role']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  listUsersQuerySchema
};
