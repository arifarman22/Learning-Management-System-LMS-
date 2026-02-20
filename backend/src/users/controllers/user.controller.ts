import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { createUserSchema, updateUserSchema, changePasswordSchema } from '../dto/user.dto';

const userService = new UserService();

export class UserController {
  async list(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await userService.getUsers(page, limit, req.query.search as string);
      res.json({ success: true, data: result.users, pagination: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages } });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async get(req: Request, res: Response) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = createUserSchema.parse(req.body);
      const user = await userService.createUser(data);
      res.status(201).json({ success: true, data: user });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const data = updateUserSchema.parse(req.body);
      const user = await userService.updateUser(req.params.id, data);
      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const data = changePasswordSchema.parse(req.body);
      const result = await userService.changePassword(req.params.id, data);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const result = await userService.deleteUser(req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async activate(req: Request, res: Response) {
    try {
      const user = await userService.activateUser(req.params.id);
      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async deactivate(req: Request, res: Response) {
    try {
      const user = await userService.deactivateUser(req.params.id);
      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
