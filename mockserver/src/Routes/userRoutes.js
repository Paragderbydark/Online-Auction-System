import express from 'express';
import userController from '../Controllers/userController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { body } from 'express-validator';
import { handleValidation } from '../middleware/validation.js';

const router = express.Router();
const validateUserUpdate = [
  body('username')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers and underscores'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('isBuyer')
    .optional()
    .isBoolean()
    .withMessage('isBuyer must be a boolean value'),
  body('isSeller')
    .optional()
    .isBoolean()
    .withMessage('isSeller must be a boolean value'),
  handleValidation
];


router.get('/', verifyToken, requireRole(['admin']), userController.getAllUsers);

router.get('/role/:role', verifyToken, requireRole(['admin']), userController.getUsersByRole);

router.get('/buyers', verifyToken, requireRole(['admin']), userController.getAllBuyers);
router.get('/buyers/:id', verifyToken, requireRole(['admin']), userController.getBuyerById);

router.get('/sellers', verifyToken, requireRole(['admin']), userController.getAllSellers);
router.get('/sellers/:id', verifyToken, requireRole(['admin']), userController.getSellerById);


router.get('/:id', verifyToken, (req, res, next) => {
  if (req.user.role === 'admin' || req.user.id === req.params.id) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. You can only access your own profile.'
  });
}, userController.getUserById);


router.put('/:id', verifyToken, (req, res, next) => {
  if (req.user.role === 'admin' || req.user.id === req.params.id) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. You can only update your own profile.'
  });
}, validateUserUpdate, userController.updateUser);


router.delete('/:id', verifyToken, requireRole(['admin']), userController.deleteUser);

export default router;