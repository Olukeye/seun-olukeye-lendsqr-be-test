import { Router } from 'express';
import UserController from '../controllers/user.controller';
import { validate } from '../middleware/validator.middleware';
import { createUserSchema } from '../utils/validators';

const router = Router();

router.post('/register', validate(createUserSchema), UserController.register);

export default router;