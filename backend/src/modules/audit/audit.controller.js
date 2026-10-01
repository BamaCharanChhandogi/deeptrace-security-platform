const auditService = require('./audit.service');

class AuditController {
  async listLogs(req, res, next) {
    try {
      const result = await auditService.listLogs(req.user.tenantId, req.query);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuditController();
