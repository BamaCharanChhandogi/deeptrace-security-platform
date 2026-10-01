const express = require('express');
const campaignController = require('./campaign.controller');
const {
  createCampaignSchema,
  updateCampaignSchema,
  assignMemberSchema,
  listQuerySchema
} = require('./campaign.validation');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');

const router = express.Router();

// All campaign routes require authentication
router.use(authenticate);

// List & Create
router.get('/', validate(listQuerySchema, 'query'), campaignController.listCampaigns);
router.post('/', authorize('ADMIN', 'MANAGER'), validate(createCampaignSchema, 'body'), campaignController.createCampaign);

// Detail, Update, Delete
router.get('/:id', campaignController.getCampaignById);
router.patch('/:id', authorize('ADMIN', 'MANAGER'), validate(updateCampaignSchema, 'body'), campaignController.updateCampaign);
router.delete('/:id', authorize('ADMIN'), campaignController.deleteCampaign);

// Campaign Members
router.get('/:id/members', campaignController.getMembers);
router.post('/:id/members', authorize('ADMIN', 'MANAGER'), validate(assignMemberSchema, 'body'), campaignController.assignMember);
router.delete('/:id/members/:userId', authorize('ADMIN', 'MANAGER'), campaignController.removeMember);

module.exports = router;
