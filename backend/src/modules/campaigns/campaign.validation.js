const { z } = require('zod');

const createCampaignSchema = z.object({
  name: z.string().min(3, 'Campaign name must be at least 3 characters').max(255),
  description: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional().default('DRAFT'),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable()
});

const updateCampaignSchema = z.object({
  name: z.string().min(3).max(255).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable()
});

const assignMemberSchema = z.object({
  userId: z.string().uuid('Invalid user UUID format')
});

const listQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
  status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['created_at', 'name', 'status', 'start_date']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

module.exports = {
  createCampaignSchema,
  updateCampaignSchema,
  assignMemberSchema,
  listQuerySchema
};
