import express from 'express';
import { db, initDatabase, Product } from '../models/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Initialize database on first use
router.use(async (req, res, next) => {
  await initDatabase();
  next();
});

// GET /api/products - Get all products
router.get('/', async (req, res) => {
  try {
    await db.read();
    const products = db.data?.products || [];
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    await db.read();
    const product = db.data?.products.find(p => p.id === req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST /api/products - Create product
router.post('/', async (req, res) => {
  try {
    await db.read();
    
    const { name, description, price, seller, imageUrl } = req.body;
    
    if (!name || !description || !price || !seller) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const product: Product = {
      id: uuidv4(),
      name,
      description,
      price: parseFloat(price),
      seller,
      imageUrl: imageUrl || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.data?.products.push(product);
    await db.write();

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', async (req, res) => {
  try {
    await db.read();
    const productIndex = db.data?.products.findIndex(p => p.id === req.params.id);
    
    if (productIndex === undefined || productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const { name, description, price, imageUrl } = req.body;
    const product = db.data!.products[productIndex];

    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = parseFloat(price);
    if (imageUrl !== undefined) product.imageUrl = imageUrl;
    product.updatedAt = new Date().toISOString();

    await db.write();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', async (req, res) => {
  try {
    await db.read();
    const productIndex = db.data?.products.findIndex(p => p.id === req.params.id);
    
    if (productIndex === undefined || productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    db.data!.products.splice(productIndex, 1);
    await db.write();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
