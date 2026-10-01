const eventService = require('./event.service');

class EventController {
  async listEvents(req, res, next) {
    try {
      const result = await eventService.listEvents(req.user.tenantId, req.query);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }

  async getEventById(req, res, next) {
    try {
      const event = await eventService.getEventById(req.params.id, req.user.tenantId);
      res.status(200).json({
        success: true,
        data: event
      });
    } catch (err) {
      next(err);
    }
  }

  async createEvent(req, res, next) {
    try {
      const event = await eventService.createEvent(
        req.user.tenantId,
        req.user.id,
        req.body,
        req
      );
      res.status(201).json({
        success: true,
        message: 'Security event recorded',
        data: event
      });
    } catch (err) {
      next(err);
    }
  }

  async updateEventStatus(req, res, next) {
    try {
      const updated = await eventService.updateEventStatus(
        req.params.id,
        req.user.tenantId,
        req.body.status,
        req.body.note,
        req
      );
      res.status(200).json({
        success: true,
        message: 'Security event status updated',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new EventController();
