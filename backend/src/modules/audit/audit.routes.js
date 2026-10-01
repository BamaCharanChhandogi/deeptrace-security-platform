const express = require('express');
const auditController = require('./audit.controller');
const { listAuditQuerySchema } = require('./audit.validation');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');

const router = express.Router();

// Strict RBAC: Audit logs are accessible ONLY to ADMIN role
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', validate(listAuditQuerySchema, 'query'), auditController.listLogs);

module.exports = router;
