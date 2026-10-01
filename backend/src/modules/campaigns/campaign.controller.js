const campaignService = require('./campaign.service');

class CampaignController {
  async listCampaigns(req, res, next) {
    try {
      const result = await campaignService.listCampaigns(req.user.tenantId, req.query);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }

  async getCampaignById(req, res, next) {
    try {
      const campaign = await campaignService.getCampaignById(req.params.id, req.user.tenantId);
      res.status(200).json({
        success: true,
        data: campaign
      });
    } catch (err) {
      next(err);
    }
  }

  async createCampaign(req, res, next) {
    try {
      const campaign = await campaignService.createCampaign(
        req.user.tenantId,
        req.user.id,
        req.body,
        req
      );
      res.status(201).json({
        success: true,
        message: 'Campaign created successfully',
        data: campaign
      });
    } catch (err) {
      next(err);
    }
  }

  async updateCampaign(req, res, next) {
    try {
      const updated = await campaignService.updateCampaign(
        req.params.id,
        req.user.tenantId,
        req.user.id,
        req.body,
        req
      );
      res.status(200).json({
        success: true,
        message: 'Campaign updated successfully',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteCampaign(req, res, next) {
    try {
      const result = await campaignService.deleteCampaign(req.params.id, req.user.tenantId, req);
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (err) {
      next(err);
    }
  }

  async getMembers(req, res, next) {
    try {
      const members = await campaignService.getMembers(req.params.id, req.user.tenantId);
      res.status(200).json({
        success: true,
        data: members
      });
    } catch (err) {
      next(err);
    }
  }

  async assignMember(req, res, next) {
    try {
      const member = await campaignService.assignMember(
        req.params.id,
        req.user.tenantId,
        req.body.userId,
        req.user.id,
        req
      );
      res.status(201).json({
        success: true,
        message: 'User assigned to campaign successfully',
        data: member
      });
    } catch (err) {
      next(err);
    }
  }

  async removeMember(req, res, next) {
    try {
      const result = await campaignService.removeMember(
        req.params.id,
        req.user.tenantId,
        req.params.userId,
        req
      );
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CampaignController();
