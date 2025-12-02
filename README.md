# 📄 Decentralized Marketplace with Escrow

A security‑focused, trustless marketplace where funds are held in a smart‑contract escrow until release conditions are met. It’s designed for learning and rapid iteration with a clear separation of concerns:

- Smart contracts (Solidity + Hardhat)
- Web UI (Next.js + Tailwind + Ethers v6)
- API helpers (Express + LowDB for product/dispute data)

All payments happen on a local Hardhat network by default. You can later point the app at a public testnet by changing environment variables and redeploying the contract.

What you get out‑of‑the‑box:

- A working escrow lifecycle (create → accept → ship → deliver → complete)
- Buyer‑opened disputes and admin resolution
- Timeout refunds when a party stalls
- Clean UI with dark mode, wallet connect/disconnect, and safety checks

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension

### 0. Clone the repository

```bash
git clone https://github.com/your-username/digitalMarketPlace.git
cd digitalMarketPlace
```

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

Alternatively, set `NEXT_PUBLIC_CONTRACT_ADDRESS` in `frontend/.env.local` (see Environment section) so you don’t have to edit source.

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

## 🧩 Configuration & Environments

### Frontend (Next.js)

- Reads `NEXT_PUBLIC_CONTRACT_ADDRESS` and `NEXT_PUBLIC_RPC_URL` at build/runtime.
- Uses `frontend/utils/contractAddress.ts` as a fallback if env vars are not set.
- Connects via MetaMask (Ethers v6 `BrowserProvider`).

### Backend (Express)

- Stores the contract address in `backend/src/config/contract.json`.
- Persists product/dispute/notification data in LowDB JSON files under `backend/data/`.

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

## 🔧 How To Modify or Extend

### Change the Smart Contract

1. Edit `blockchain/contracts/Escrow.sol`.
2. Run tests: `cd blockchain && npx hardhat test`.
3. Start a node (if needed): `npx hardhat node`.
4. Deploy again: `npx hardhat run scripts/deploy.js --network localhost`.
5. Update the deployed address in:
   - `frontend/.env.local` as `NEXT_PUBLIC_CONTRACT_ADDRESS`, or
   - `frontend/utils/contractAddress.ts` fallback, and
   - `backend/src/config/contract.json`.

### Change the Frontend

- Pages live in `frontend/app/*` using the App Router.
- UI components in `frontend/components/*` and `frontend/components/ui/*`.
- Contract access is centralized in `frontend/hooks/useContract.ts`.
- Run: `cd frontend && npm run dev`.

### Change the Backend

- Express routes in `backend/src/routes/*`.
- LowDB models/utilities in `backend/src/models` and `backend/src/utils`.
- Run: `cd backend && npm run dev`.

### Deploy to a Testnet (Optional)

1. Add a network to `blockchain/hardhat.config.js` (e.g., Sepolia) with an RPC URL and private key.
2. Deploy: `npx hardhat run scripts/deploy.js --network sepolia`.
3. Set the address in `frontend/.env.local` → `NEXT_PUBLIC_CONTRACT_ADDRESS` and update backend config.

## 🏁 Usage Flow

1. **Buyer** browses products on `/buy`
2. **Buyer** creates an order, locking funds in escrow
3. **Seller** accepts the order on `/dashboard`
4. **Seller** marks product as shipped
5. **Buyer** confirms delivery → funds released to seller
6. If dispute: **Buyer** opens dispute → **Admin** resolves on `/disputes`

## 📦 Commands Cheatsheet

| Task             | Command                                                                  |
| ---------------- | ------------------------------------------------------------------------ |
| Start blockchain | `cd blockchain && npx hardhat node`                                      |
| Deploy contract  | `cd blockchain && npx hardhat run scripts/deploy.js --network localhost` |
| Run backend      | `cd backend && npm run dev`                                              |
| Run frontend     | `cd frontend && npm run dev`                                             |
| Test contract    | `cd blockchain && npx hardhat test`                                      |

## 🐛 Troubleshooting

- **MetaMask connection issues**: Make sure you're connected to Localhost 8545 network
- **Contract not found**: Verify contract address is set correctly in both frontend and backend
- **Transaction fails**: Check you have enough ETH in your MetaMask account
- **Backend errors**: Ensure `data/` directory exists and is writable

## 🔒 Security Notes

- Admin can resolve disputes and direct funds to buyer or seller — keep the admin key safe.
- Contract rejects direct `receive()` payments and enforces role checks.
- Dispute state blocks delivery confirmation and fund releases.
- Timeouts refund the buyer if the order doesn’t progress.

## 🤝 Contributing

Pull requests are welcome! For larger changes:

- Open an issue describing the enhancement/bug.
- Add/adjust tests under `blockchain/test/` when changing the contract.
- Keep commits small and focused; prefer conventional commit prefixes (e.g., `frontend:`, `blockchain:`, `backend:`).

## 📄 License

ISC
