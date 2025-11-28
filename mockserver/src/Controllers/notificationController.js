import express from 'express';
import db from '../utils/database.js';

const router = express.Router();

export const getAllNotifications = (req, res) => {
  try {
    const notifications = db.getAll('notifications');
    
    const sortedNotifications = notifications.sort((a, b) => 
      new Date(b.time) - new Date(a.time)
    );
    
    res.json({
      success: true,
      data: sortedNotifications,
      count: sortedNotifications.length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch notifications'
    });
  }
};

export const getUserNotifications = (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = db.getByQuery('notifications', { userId });
    
    const sortedNotifications = notifications.sort((a, b) => 
      new Date(b.time) - new Date(a.time)
    );
    
    res.json({
      success: true,
      data: sortedNotifications,
      count: sortedNotifications.length,
      unreadCount: sortedNotifications.filter(n => n.status === 'unread').length
    });
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch user notifications'
    });
  }
};

export const getUnreadCount = (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = db.getByQuery('notifications', { userId, status: 'unread' });
    
    res.json({
      success: true,
      unreadCount: notifications.length
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch unread count'
    });
  }
};

export const markAsRead = (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedNotification = db.update('notifications', id, { 
      status: 'read',
      isNew: false 
    });
    
    if (!updatedNotification) {
      return res.status(404).json({ 
        success: false,
        message: 'Notification not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Notification marked as read',
      data: updatedNotification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to mark notification as read'
    });
  }
};

export const markAllAsRead = (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = db.getByQuery('notifications', { userId, status: 'unread' });
    
    const updatedNotifications = notifications.map(notification => {
      return db.update('notifications', notification.id, { 
        status: 'read',
        isNew: false 
      });
    });
    
    res.json({
      success: true,
      message: `Marked ${updatedNotifications.length} notifications as read`,
      data: updatedNotifications
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to mark all notifications as read'
    });
  }
};

export const createNotification = (req, res) => {
  try {
    const { userId, type, title, subject, message, priority = 'medium', icon } = req.body;
    
    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, type, title, message'
      });
    }
    
    const newNotification = {
      userId,
      type,
      title,
      subject: subject || title,
      message,
      time: new Date().toISOString(),
      status: 'unread',
      isNew: true,
      icon: icon || '📩',
      priority
    };
    
    const createdNotification = db.create('notifications', newNotification);
    
    if (!createdNotification) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create notification'
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: createdNotification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to create notification'
    });
  }
};

export const deleteNotification = (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = db.delete('notifications', id);
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false,
        message: 'Notification not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete notification'
    });
  }
};
