const { z } = require('zod');

const listAuditQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('15'),
  action: z.string().optional(),
  entityType: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['created_at', 'action', 'entity_type']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

module.exports = {
  listAuditQuerySchema
};
