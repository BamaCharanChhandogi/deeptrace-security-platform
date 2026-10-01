const { z } = require('zod');

const createEventSchema = z.object({
  event_type: z.string().min(2).max(50),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  status: z.enum(['OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED']).optional().default('OPEN'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  source: z.string().max(255).optional().nullable(),
  metadata: z.record(z.any()).optional().nullable()
});

const updateEventStatusSchema = z.object({
  status: z.enum(['OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED']),
  note: z.string().optional()
});

const listEventsQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum(['OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED']).optional(),
  type: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['created_at', 'severity', 'status', 'event_type']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

module.exports = {
  createEventSchema,
  updateEventStatusSchema,
  listEventsQuerySchema
};
