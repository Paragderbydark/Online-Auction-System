import express from 'express';
import db from '../utils/database.js';
import { 
  getAllNotifications,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification
} from '../Controllers/notificationController.js';

const router = express.Router();

router.get('/', getAllNotifications);
router.get('/user/:userId', getUserNotifications);
router.get('/user/:userId/unread-count', getUnreadCount);

router.put('/:id/read', markAsRead);
router.put('/user/:userId/read-all', markAllAsRead);

router.post('/', createNotification);

router.delete('/:id', deleteNotification);

export default router;