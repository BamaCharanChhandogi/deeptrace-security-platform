const dashboardService = require('./dashboard.service');

class DashboardController {
  async getStats(req, res, next) {
    try {
      const stats = await dashboardService.getTenantStats(req.user.tenantId);
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DashboardController();
