const express = require('express');
const eventController = require('./event.controller');
const {
  createEventSchema,
  updateEventStatusSchema,
  listEventsQuerySchema
} = require('./event.validation');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');

const router = express.Router();

router.use(authenticate);

router.get('/', validate(listEventsQuerySchema, 'query'), eventController.listEvents);
router.post('/', authorize('ADMIN', 'MANAGER'), validate(createEventSchema, 'body'), eventController.createEvent);
router.get('/:id', eventController.getEventById);
router.patch('/:id', authorize('ADMIN', 'MANAGER'), validate(updateEventStatusSchema, 'body'), eventController.updateEventStatus);

module.exports = router;
