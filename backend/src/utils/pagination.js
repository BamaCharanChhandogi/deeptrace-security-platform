/**
 * Server-side pagination helper for Knex query builder
 * @param {import('knex').Knex.QueryBuilder} queryBuilder - Base query builder with filters applied
 * @param {object} options - Pagination options
 * @param {number} options.page - Current page number (1-indexed)
 * @param {number} options.limit - Number of items per page
 * @returns {Promise<{ data: Array, pagination: { page: number, limit: number, total: number, totalPages: number } }>}
 */
async function paginate(queryBuilder, { page = 1, limit = 10 } = {}) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const offset = (pageNum - 1) * limitNum;

  // Clone query to count total records matching filters
  const countQuery = queryBuilder.clone().clearSelect().clearOrder().count('* as total');
  const countResult = await countQuery;
  const total = parseInt(countResult[0]?.total || 0, 10);
  const totalPages = Math.ceil(total / limitNum) || 1;

  // Fetch paginated slice
  const data = await queryBuilder.offset(offset).limit(limitNum);

  return {
    data,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages
    }
  };
}

module.exports = { paginate };
