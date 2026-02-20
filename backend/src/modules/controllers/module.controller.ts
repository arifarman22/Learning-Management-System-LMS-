import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ModuleController {
  async getModulesByCourse(req: Request, res: Response) {
    try {
      const { courseId } = req.params;

      const modules = await prisma.module.findMany({
        where: { courseId },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            select: {
              id: true,
              title: true,
              type: true,
              duration: true,
              order: true,
              isFree: true,
              videoUrl: true,
              content: true,
            },
          },
        },
        orderBy: { order: 'asc' },
      });

      res.json({
        success: true,
        data: modules,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch modules',
      });
    }
  }

  async getModule(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const module = await prisma.module.findUnique({
        where: { id },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
          },
          course: {
            select: {
              id: true,
              title: true,
              instructorId: true,
            },
          },
        },
      });

      if (!module) {
        return res.status(404).json({
          success: false,
          error: 'Module not found',
        });
      }

      res.json({
        success: true,
        data: module,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch module',
      });
    }
  }

  async createModule(req: Request, res: Response) {
    try {
      const { title, description, courseId, order } = req.body;

      const module = await prisma.module.create({
        data: {
          title,
          description,
          courseId,
          order: order || 1,
        },
      });

      res.status(201).json({
        success: true,
        data: module,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create module',
      });
    }
  }

  async updateModule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, description, order } = req.body;

      const module = await prisma.module.update({
        where: { id },
        data: {
          title,
          description,
          order,
        },
      });

      res.json({
        success: true,
        data: module,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update module',
      });
    }
  }

  async deleteModule(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.module.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'Module deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete module',
      });
    }
  }
}