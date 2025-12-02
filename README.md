# 📄 Decentralized Marketplace with Escrow

A **Decentralized Marketplace with Smart Escrow** built for learning and demonstration.
All payments happen using **local ETH** from Hardhat's local blockchain.
Users interact through a **Next.js frontend**, MetaMask wallet, and an **Express backend** for helper features like product listings & dispute logs.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Blockchain
cd ../blockchain
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Start Hardhat Local Blockchain

In the `blockchain` directory:

```bash
npx hardhat node
```

This starts a blockchain at `http://127.0.0.1:8545` with 20 accounts, each with 10,000 ETH.

**Important:** Copy the first private key and import it into MetaMask.

### 3. Deploy Smart Contract

In a new terminal, in the `blockchain` directory:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Copy the deployed contract address and update:
- `frontend/utils/contractAddress.ts` - Set `CONTRACT_ADDRESS`
- `backend/src/config/contract.json` - Set `address`

### 4. Start Backend

In the `backend` directory:

```bash
npm run dev
```

Backend runs at `http://localhost:4000`

### 5. Start Frontend

In the `frontend` directory:

```bash
npm run dev
```

Frontend runs at `http://localhost:3000`

## 🧱 Project Structure

```
project-root/
│
├── backend/                 # Express server (products, arbitration logs, notifications)
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   └── server.ts
│   └── data/                # lowDb JSON database
│
├── blockchain/              # Hardhat Smart Contracts
│   ├── contracts/
│   │   └── Escrow.sol
│   ├── scripts/
│   │   └── deploy.js
│   └── test/
│
└── frontend/                # Next.js + Ethers.js UI
    ├── app/
    ├── components/
    ├── hooks/
    └── services/
```

## 🧩 Features

### Smart Contract Features

- ✅ Create escrow (buyer initiates)
- ✅ Seller approves order
- ✅ Seller marks "Product Shipped"
- ✅ Buyer confirms delivery → Seller gets paid
- ✅ Buyer disputes → Escrow freezes funds
- ✅ Admin arbitrates → funds go to one party
- ✅ Automatic release after timeout
- ✅ Event logging (Created, Shipped, Released, DisputeOpened, Resolved)

### Frontend Features

- ✅ Connect MetaMask
- ✅ View available products
- ✅ Create an order + lock funds
- ✅ Seller dashboard (approve orders, mark shipped)
- ✅ Buyer dashboard (confirm, dispute)
- ✅ Arbitration dashboard (admin)
- ✅ Complete order history logs

### Backend Features

- ✅ Product CRUD
- ✅ Dispute summaries storage
- ✅ Notification queue (local JSON)
- ✅ Admin endpoints for arbitration panel

## 🛠 Tech Stack

### Smart Contract Layer
- **Solidity** ^0.8.20
- **Hardhat**
- **Ethers v6**

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Ethers.js**
- **Zustand** (for state management)

### Backend
- **Express.js**
- **TypeScript (ESM)**
- **lowDb** (local JSON database)
- **Nodemon**

## 📡 API Routes

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Disputes
- `GET /api/disputes` - Get all disputes
- `GET /api/disputes/:orderId` - Get dispute by order ID
- `POST /api/disputes` - Create dispute

### Arbitration
- `POST /api/arbitration/resolve` - Resolve a dispute
- `GET /api/arbitration` - Get all arbitrations

### Notifications
- `GET /api/notifications/:userId` - Get notifications for user
- `POST /api/notifications` - Create notification

## 🧠 Smart Contract States

```
PENDING → SELLER_ACCEPTED → SHIPPED → DELIVERED → COMPLETE
                               ↓
                            DISPUTE → RESOLVED
```

## 🧪 Testing

Test the smart contract:

```bash
cd blockchain
npx hardhat test
```

## 📝 Environment Variables

### Frontend
Create `.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### Backend
Create `.env`:
```
PORT=4000
```

## 🏁 Usage Flow

1. **Buyer** browses products on `/buy`
2. **Buyer** creates an order, locking funds in escrow
3. **Seller** accepts the order on `/dashboard`
4. **Seller** marks product as shipped
5. **Buyer** confirms delivery → funds released to seller
6. If dispute: **Buyer** opens dispute → **Admin** resolves on `/disputes`

## 📦 Commands Cheatsheet

| Task             | Command                                                 |
| ---------------- | ------------------------------------------------------- |
| Start blockchain | `cd blockchain && npx hardhat node`                     |
| Deploy contract  | `cd blockchain && npx hardhat run scripts/deploy.js --network localhost` |
| Run backend      | `cd backend && npm run dev`                            |
| Run frontend     | `cd frontend && npm run dev`                            |
| Test contract    | `cd blockchain && npx hardhat test`                     |

## 🐛 Troubleshooting

- **MetaMask connection issues**: Make sure you're connected to Localhost 8545 network
- **Contract not found**: Verify contract address is set correctly in both frontend and backend
- **Transaction fails**: Check you have enough ETH in your MetaMask account
- **Backend errors**: Ensure `data/` directory exists and is writable

## 📄 License

ISC
