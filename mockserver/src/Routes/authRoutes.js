import express from 'express';
import { register, login, logout, getProfile } from '../Controllers/authController.js';
import { validateUserRegistration, validateUserLogin } from '../middleware/validation.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();


router.post('/register', validateUserRegistration, register);


router.post('/login', validateUserLogin, login);


router.post('/logout', logout);


router.get('/profile', verifyToken, getProfile);

export default router;
