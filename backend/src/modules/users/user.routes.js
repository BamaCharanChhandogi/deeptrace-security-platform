const express = require('express');
const userController = require('./user.controller');
const {
  createUserSchema,
  updateUserSchema,
  listUsersQuerySchema
} = require('./user.validation');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');

const router = express.Router();

router.use(authenticate);

router.get('/', validate(listUsersQuerySchema, 'query'), userController.listUsers);
router.get('/:id', userController.getUserById);
router.post('/', authorize('ADMIN'), validate(createUserSchema, 'body'), userController.createUser);
router.patch('/:id', authorize('ADMIN'), validate(updateUserSchema, 'body'), userController.updateUser);

module.exports = router;
