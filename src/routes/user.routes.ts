import { Router } from 'express';
import UserController from '../controllers/user.controller';
import { validate } from '../middleware/validator.middleware';
import { createUserSchema, loginSchema } from '../utils/validators';

const router = Router();

router.post('/register', validate(createUserSchema), UserController.register);
router.post('/login', validate(loginSchema), UserController.login);

module.exports = router;
