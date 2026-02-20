import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from './middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/refresh', (req, res) => authController.refresh(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));
router.post('/logout-all', authenticate, (req, res) => authController.logoutAll(req, res));
router.get('/me', authenticate, (req, res) => authController.me(req, res));

export default router;
