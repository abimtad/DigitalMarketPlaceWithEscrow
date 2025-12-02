import express from 'express';
import { db, initDatabase, Notification } from '../models/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.use(async (req, res, next) => {
  await initDatabase();
  next();
});

// GET /api/notifications/:userId - Get notifications for user
router.get('/:userId', async (req, res) => {
  try {
    await db.read();
    const userId = req.params.userId.toLowerCase();
    const notifications = (db.data?.notifications || [])
      .filter(n => n.userId.toLowerCase() === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// POST /api/notifications - Create notification
router.post('/', async (req, res) => {
  try {
    await db.read();
    
    const { userId, type, message, orderId } = req.body;
    
    if (!userId || !type || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const notification: Notification = {
      id: uuidv4(),
      userId,
      type,
      message,
      read: false,
      createdAt: new Date().toISOString(),
      orderId: orderId ? parseInt(orderId) : undefined
    };

    db.data?.notifications.push(notification);
    await db.write();

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    await db.read();
    const notification = db.data?.notifications.find(n => n.id === req.params.id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    notification.read = true;
    await db.write();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// PUT /api/notifications/user/:userId/read-all - Mark all notifications as read
router.put('/user/:userId/read-all', async (req, res) => {
  try {
    await db.read();
    const userId = req.params.userId.toLowerCase();
    const notifications = db.data?.notifications.filter(n => n.userId.toLowerCase() === userId);
    
    notifications?.forEach(n => {
      n.read = true;
    });

    await db.write();

    res.json({ message: 'All notifications marked as read', count: notifications?.length || 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

export default router;
