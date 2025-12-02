import express from 'express';
import { db, initDatabase, Arbitration } from '../models/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.use(async (req, res, next) => {
  await initDatabase();
  next();
});

// POST /api/arbitration/resolve - Resolve a dispute
router.post('/resolve', async (req, res) => {
  try {
    await db.read();
    
    const { orderId, arbitrator, winner, reason } = req.body;
    
    if (!orderId || !arbitrator || !winner || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const arbitration: Arbitration = {
      id: uuidv4(),
      orderId: parseInt(orderId),
      arbitrator,
      winner,
      reason,
      createdAt: new Date().toISOString()
    };

    // Update dispute status
    const dispute = db.data?.disputes.find(d => d.orderId === parseInt(orderId));
    if (dispute) {
      dispute.status = 'resolved';
      dispute.resolvedAt = new Date().toISOString();
      dispute.resolution = reason;
    }

    db.data?.arbitrations.push(arbitration);
    await db.write();

    res.status(201).json(arbitration);
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve dispute' });
  }
});

// GET /api/arbitration - Get all arbitrations
router.get('/', async (req, res) => {
  try {
    await db.read();
    const arbitrations = db.data?.arbitrations || [];
    res.json(arbitrations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch arbitrations' });
  }
});

// GET /api/arbitration/:orderId - Get arbitration by order ID
router.get('/:orderId', async (req, res) => {
  try {
    await db.read();
    const orderId = parseInt(req.params.orderId);
    const arbitration = db.data?.arbitrations.find(a => a.orderId === orderId);
    
    if (!arbitration) {
      return res.status(404).json({ error: 'Arbitration not found' });
    }
    
    res.json(arbitration);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch arbitration' });
  }
});

export default router;
