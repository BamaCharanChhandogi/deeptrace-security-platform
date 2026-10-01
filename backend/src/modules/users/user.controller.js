const userService = require('./user.service');

class UserController {
  async listUsers(req, res, next) {
    try {
      const result = await userService.listUsers(req.user.tenantId, req.query);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id, req.user.tenantId);
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (err) {
      next(err);
    }
  }

  async createUser(req, res, next) {
    try {
      const user = await userService.createUser(req.user.tenantId, req.body, req);
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user
      });
    } catch (err) {
      next(err);
    }
  }

  async updateUser(req, res, next) {
    try {
      const user = await userService.updateUser(req.params.id, req.user.tenantId, req.body, req);
      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
