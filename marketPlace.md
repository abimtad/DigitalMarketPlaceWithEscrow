# 📄 **README.md — Decentralized Marketplace with Escrow (Local, Hardhat, Next.js, Ethers.js)**

## 🚀 Project Overview

This project is a **Decentralized Marketplace with Smart Escrow**, built for learning and demonstration.
All payments happen using **local ETH** from Hardhat’s local blockchain.
Users interact through a **Next.js frontend**, MetaMask wallet, and an **Express backend** for helper features like product listings & dispute logs.

### 🔐 Core Blockchain Goal

> Build a trustless escrow smart contract where funds are locked until both buyer & seller agree OR specific rules trigger release.

---

## 🧱 **High-Level Architecture**

```
project-root/
│
├── backend/                 # Express server (products, arbitration logs, notifications)
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── models/              # (If using local JSON DB)
│   ├── utils/
│   └── server.js
│
├── blockchain/              # Hardhat Smart Contracts
│   ├── contracts/
│   │   └── Escrow.sol
│   ├── scripts/
│   │   └── deploy.js
│   ├── test/
│   └── hardhat.config.js
│
├── frontend/                # Next.js + Ethers.js UI
│   ├── app/
│   │   ├── buy/
│   │   ├── sell/
│   │   ├── disputes/
│   │   ├── dashboard/
│   │   └── globals.css
│   ├── components/
│   ├── hooks/
│   │   └── useContract.js
│   ├── services/
│   │   └── api.js
│   └── utils/
│
└── README.md
```

---

# 🧩 Features

### ⭐ MVP (Smart Contract Required for Grade)

- Create escrow (buyer initiates)
- Seller approves order
- Seller marks “Product Shipped”
- Buyer confirms delivery → Seller gets paid
- Buyer disputes → Escrow freezes funds
- Admin arbitrates → funds go to one party
- Automatic release after timeout
- Event logging (Created, Shipped, Released, DisputeOpened, Resolved)

### ⭐ Frontend Features (Next.js)

- Connect MetaMask
- View available products
- Create an order + lock funds
- Seller dashboard (approve orders, mark shipped)
- Buyer dashboard (confirm, dispute)
- Arbitration dashboard (admin)
- Complete order history logs
- Toast notifications

### ⭐ Backend Features (Express)

- Product CRUD
- Dispute summaries storage
- Email-like notification queue (local JSON)
- Admin endpoints for arbitration panel
- API for product images (multer)

---

# 🛠 **Tech Stack**

### 🧩 Smart Contract Layer

- **Solidity**
- **Hardhat**
- **Ethers v6**
- **Local Hardhat Network (20 accounts, 10k ETH each)**

### 🌐 Frontend

- **Next.js 14 (App Router)**
- **Tailwind CSS**
- **Ethers.js**
- **MetaMask provider**
- **Zustand** for global state
- **Shadcn/UI** (modern UI)

### 🔙 Backend

- **Express.js**
- **Node.js**
- **Nodemon**
- **Local JSON file DB** (no cost, simple)

---

# 🧪 Installation

## 1️⃣ Clone Repo

```bash
git clone https://github.com/your-username/escrow-marketplace.git
cd escrow-marketplace
```

---

## 2️⃣ Install Dependencies

### Backend

```bash
cd backend
npm install
```

### Blockchain

```bash
cd blockchain
npm install
```

### Frontend

```bash
cd frontend
npm install
```

---

# 🔥 Run Hardhat Local Blockchain

```bash
cd blockchain
npx hardhat node
```

This starts a blockchain at:

```
http://127.0.0.1:8545
```

It gives you:

- 20 accounts
- each with **10,000 ETH**

Copy the first private key → import to MetaMask.

---

# 📦 Deploy Smart Contract (Local)

In another terminal:

```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

This prints:

```
Escrow Contract deployed at: 0x1234....
```

Copy the address → put inside:

```
frontend/utils/contractAddress.js
backend/config/contract.json
```

---

# 💻 Run Backend API

```bash
cd backend
npm run dev
```

Runs at:

```
http://localhost:4000
```

---

# 🖥 Run Frontend

```bash
cd frontend
npm run dev
```

Runs at:

```
http://localhost:3000
```

---

# 🧠 Smart Contract States (Core Logic)

```
PENDING → SELLER_ACCEPTED → SHIPPED → DELIVERED → COMPLETE
                               ↓
                            DISPUTE → RESOLVED
```

Every state triggers an event for UI listening.

---

# 📡 Frontend–Blockchain Flow (Ethers.js)

### Example (Buyer initiates escrow):

```javascript
const contract = getEscrowContract();
await contract.createEscrow(productId, seller, {
  value: ethers.parseEther("1.0"),
});
```

### Seller accepts:

```javascript
await contract.acceptOrder(orderId);
```

### Buyer confirms delivery:

```javascript
await contract.releaseFunds(orderId);
```

### Dispute:

```javascript
await contract.openDispute(orderId, "Product not received");
```

---

# 🧵 Backend API Routes

### Products

```
POST /products
GET /products
GET /products/:id
```

### Disputes

```
POST /disputes
GET /disputes/:orderId
```

### Arbitration (Admin)

```
POST /arbitrate
```

---

# 📂 Suggested Contract Structure

```
blockchain/contracts/
│
└── Escrow.sol
```

Key elements:

- Struct `EscrowOrder`
- Enum `Status`
- createEscrow
- acceptOrder
- markShipped
- confirmDelivery
- openDispute
- resolveDispute
- timeout auto-release
- events for UI

---

# 🛠 Commands Cheatsheet

| Task             | Command                                                 |
| ---------------- | ------------------------------------------------------- |
| Start blockchain | `npx hardhat node`                                      |
| Deploy contract  | `npx hardhat run scripts/deploy.js --network localhost` |
| Run backend      | `npm run dev`                                           |
| Run frontend     | `npm run dev`                                           |
| Test contract    | `npx hardhat test`                                      |

---

# 🏁 Deliverables Checklist (For Competition)

### Smart Contract

✔ Escrow contract
✔ Events + states
✔ Test cases
✔ Deployment scripts

### Frontend

✔ Connect wallet
✔ Buyer/seller flows
✔ Product marketplace
✔ Dispute section
✔ Admin arbitration panel
✔ Real-time events
✔ Use shadcn for components unless necessary to write components by urself.
✔ Use TypeScript for the frontend.
✔ Use Tailwind CSS for styling.
✔ Use Next.js with the App Router for the frontend structure.
✔ Buil a ui thats like the vercel website

### Backend

✔ Product API
✔ Dispute DB
✔ Arbitration logs
✔ Notification system
✔ Use lowDb for the database
✔ Use ESM (TypeScript) for the backend.

UI:

- add dark and white mode
- correct the contrast
- change it to an ecommerce site and pre populate with data
- vercel like ui with grid at some places
- a filter and search for for items
- detail pages for items

> P.S. Commit after every meaningful change using Conventional Commits (e.g., feat: add escrow creation, fix: resolve deployment bug).
