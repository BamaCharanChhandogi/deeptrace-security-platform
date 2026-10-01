const VALID_TRANSITIONS = {
  DRAFT: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: []
};

/**
 * Check if transitioning from currentStatus to newStatus is allowed
 * @param {string} currentStatus 
 * @param {string} newStatus 
 * @returns {boolean}
 */
function isValidTransition(currentStatus, newStatus) {
  if (currentStatus === newStatus) return true; // Idempotent
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  return allowed.includes(newStatus);
}

/**
 * Get allowed next statuses for a given status
 * @param {string} status 
 * @returns {string[]}
 */
function getAllowedTransitions(status) {
  return VALID_TRANSITIONS[status] || [];
}

module.exports = {
  VALID_TRANSITIONS,
  isValidTransition,
  getAllowedTransitions
};
