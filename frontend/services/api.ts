import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  seller: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Dispute {
  id: string;
  orderId: number;
  buyer: string;
  seller: string;
  reason: string;
  status: 'open' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
}

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data;
  },
  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  create: async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    const response = await api.post('/products', product);
    return response.data;
  },
};

export const disputeService = {
  getByOrderId: async (orderId: number): Promise<Dispute> => {
    const response = await api.get(`/disputes/${orderId}`);
    return response.data;
  },
  create: async (dispute: Omit<Dispute, 'id' | 'createdAt' | 'status'>): Promise<Dispute> => {
    const response = await api.post('/disputes', dispute);
    return response.data;
  },
};
