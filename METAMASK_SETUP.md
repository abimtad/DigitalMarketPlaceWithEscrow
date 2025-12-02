# 🔐 MetaMask Setup Guide for Hardhat Local Network

## Step 1: Start Hardhat Node

In your terminal, run:

```bash
cd blockchain
npx hardhat node
```

You should see output like this:

```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========

Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

... (more accounts)
```

**Keep this terminal running!** The Hardhat node must stay active.

## Step 2: Add Hardhat Network to MetaMask

1. **Open MetaMask** in your browser
2. Click on the network dropdown (usually shows "Ethereum Mainnet" or another network)
3. Click **"Add Network"** or **"Add a network manually"**
4. Fill in the following details:

   - **Network Name**: `Hardhat Local`
   - **New RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`
   - **Block Explorer URL**: (leave empty or use `http://localhost:8545`)

5. Click **"Save"**

## Step 3: Import an Account from Hardhat

1. In MetaMask, click the **account icon** (circle) in the top right
2. Click **"Import Account"**
3. Copy one of the **Private Keys** from the Hardhat node output (from Step 1)
   - Example: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
4. Paste the private key into MetaMask
5. Click **"Import"**

## Step 4: Verify Setup

1. Make sure you're connected to **"Hardhat Local"** network in MetaMask
2. You should see **10,000 ETH** in your account balance
3. Your account address should match one from the Hardhat output

## Step 5: Test the Connection

1. Open your frontend at `http://localhost:3000`
2. Click **"Connect Wallet"** button
3. MetaMask should prompt you to connect
4. Approve the connection
5. You should see your account address displayed in the UI

## Troubleshooting

### MetaMask shows "Wrong Network"
- Make sure you selected "Hardhat Local" from the network dropdown
- Verify the Chain ID is `31337`

### "Insufficient funds" error
- Make sure you imported an account that has ETH
- Check that Hardhat node is still running
- The account should have 10,000 ETH

### Can't connect to Hardhat node
- Verify Hardhat node is running: `npx hardhat node`
- Check the URL is correct: `http://127.0.0.1:8545`
- Make sure no firewall is blocking localhost connections

### Transaction fails
- Ensure Hardhat node is running
- Check you're on the correct network (Hardhat Local, Chain ID 31337)
- Verify the contract address is correct in your frontend

## Quick Reference

- **Network Name**: Hardhat Local
- **RPC URL**: http://127.0.0.1:8545
- **Chain ID**: 31337
- **Currency**: ETH
- **Default Balance**: 10,000 ETH per account

## Using Multiple Accounts

You can import multiple Hardhat accounts into MetaMask:
1. Create a new account in MetaMask (or use the account switcher)
2. Import another private key from the Hardhat output
3. Switch between accounts to test buyer/seller scenarios

**Tip**: Use Account #0 as your main account, Account #1 as seller, Account #2 as buyer, etc.
