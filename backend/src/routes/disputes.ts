import express from 'express';
import { db, initDatabase, Dispute } from '../models/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.use(async (req, res, next) => {
  await initDatabase();
  next();
});

// GET /api/disputes - Get all disputes
router.get('/', async (req, res) => {
  try {
    await db.read();
    const disputes = db.data?.disputes || [];
    res.json(disputes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch disputes' });
  }
});

// GET /api/disputes/:orderId - Get dispute by order ID
router.get('/:orderId', async (req, res) => {
  try {
    await db.read();
    const orderId = parseInt(req.params.orderId);
    const dispute = db.data?.disputes.find(d => d.orderId === orderId);
    
    if (!dispute) {
      return res.status(404).json({ error: 'Dispute not found' });
    }
    
    res.json(dispute);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dispute' });
  }
});

// POST /api/disputes - Create dispute
router.post('/', async (req, res) => {
  try {
    await db.read();
    
    const { orderId, buyer, seller, reason } = req.body;
    
    if (!orderId || !buyer || !seller || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if dispute already exists
    const existingDispute = db.data?.disputes.find(d => d.orderId === parseInt(orderId));
    if (existingDispute) {
      return res.status(400).json({ error: 'Dispute already exists for this order' });
    }

    const dispute: Dispute = {
      id: uuidv4(),
      orderId: parseInt(orderId),
      buyer,
      seller,
      reason,
      status: 'open',
      createdAt: new Date().toISOString()
    };

    db.data?.disputes.push(dispute);
    await db.write();

    res.status(201).json(dispute);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create dispute' });
  }
});

// PUT /api/disputes/:id - Update dispute status
router.put('/:id', async (req, res) => {
  try {
    await db.read();
    const dispute = db.data?.disputes.find(d => d.id === req.params.id);
    
    if (!dispute) {
      return res.status(404).json({ error: 'Dispute not found' });
    }

    const { status, resolution } = req.body;
    if (status) dispute.status = status;
    if (resolution) dispute.resolution = resolution;
    if (status === 'resolved') {
      dispute.resolvedAt = new Date().toISOString();
    }

    await db.write();
    res.json(dispute);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update dispute' });
  }
});

export default router;
