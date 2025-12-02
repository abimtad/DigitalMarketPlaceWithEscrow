const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Escrow", function () {
  let escrow;
  let owner;
  let buyer;
  let seller;
  let admin;

  beforeEach(async function () {
    [owner, buyer, seller, admin] = await ethers.getSigners();

    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy();
    await escrow.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right admin", async function () {
      expect(await escrow.admin()).to.equal(owner.address);
    });
  });

  describe("Creating Escrow", function () {
    it("Should create an escrow order", async function () {
      const amount = ethers.parseEther("1.0");
      await expect(
        escrow
          .connect(buyer)
          .createEscrow("product-1", seller.address, { value: amount })
      )
        .to.emit(escrow, "EscrowCreated")
        .withArgs(1, buyer.address, seller.address, amount, "product-1");
    });

    it("Should reject zero amount", async function () {
      await expect(
        escrow
          .connect(buyer)
          .createEscrow("product-1", seller.address, { value: 0 })
      ).to.be.revertedWith("Amount must be greater than 0");
    });
  });

  describe("Order Flow", function () {
    let orderId;
    const amount = ethers.parseEther("1.0");

    beforeEach(async function () {
      await escrow
        .connect(buyer)
        .createEscrow("product-1", seller.address, { value: amount });
      orderId = 1;
    });

    it("Should allow seller to accept order", async function () {
      await expect(escrow.connect(seller).acceptOrder(orderId))
        .to.emit(escrow, "OrderAccepted")
        .withArgs(orderId, seller.address);
    });

    it("Should allow seller to mark as shipped", async function () {
      await escrow.connect(seller).acceptOrder(orderId);
      await expect(escrow.connect(seller).markShipped(orderId))
        .to.emit(escrow, "OrderShipped")
        .withArgs(orderId);
    });

    it("Should allow buyer to confirm delivery", async function () {
      await escrow.connect(seller).acceptOrder(orderId);
      await escrow.connect(seller).markShipped(orderId);
      await expect(escrow.connect(buyer).confirmDelivery(orderId))
        .to.emit(escrow, "DeliveryConfirmed")
        .withArgs(orderId);
    });
  });

  describe("Disputes and Resolution", function () {
    let orderId;
    const amount = ethers.parseEther("1.0");

    beforeEach(async function () {
      await escrow
        .connect(buyer)
        .createEscrow("product-2", seller.address, { value: amount });
      orderId = 1;
      await escrow.connect(seller).acceptOrder(orderId);
    });

    it("Buyer can open dispute in accepted or shipped state", async function () {
      await expect(escrow.connect(buyer).openDispute(orderId, "Not received"))
        .to.emit(escrow, "DisputeOpened")
        .withArgs(orderId, buyer.address, "Not received");
    });

    it("Admin resolves dispute and transfers funds to winner", async function () {
      await escrow.connect(buyer).openDispute(orderId, "Damaged item");
      const balBeforeBuyer = await ethers.provider.getBalance(buyer.address);
      await expect(escrow.connect(owner).resolveDispute(orderId, buyer.address))
        .to.emit(escrow, "DisputeResolved")
        .withArgs(orderId, buyer.address, amount, owner.address);
      const balAfterBuyer = await ethers.provider.getBalance(buyer.address);
      expect(balAfterBuyer).to.be.gt(balBeforeBuyer);
    });
  });

  describe("Timeout and Refund", function () {
    it("Refunds buyer on timeout when seller stalls", async function () {
      const amount = ethers.parseEther("0.5");
      await escrow
        .connect(buyer)
        .createEscrow("product-3", seller.address, { value: amount });
      const orderId = 1;
      // fast-forward time by 8 days
      await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      const balBeforeBuyer = await ethers.provider.getBalance(buyer.address);
      await escrow.connect(buyer).checkTimeout(orderId);
      const balAfterBuyer = await ethers.provider.getBalance(buyer.address);
      expect(balAfterBuyer).to.be.gt(balBeforeBuyer);
    });
  });

  describe("Invalid Scenarios", function () {
    it("Prevents self-escrow", async function () {
      const amount = ethers.parseEther("0.1");
      await expect(
        escrow
          .connect(buyer)
          .createEscrow("product-self", buyer.address, { value: amount })
      ).to.be.revertedWith("Cannot create escrow for yourself");
    });

    it("Prevents delivery confirmation during dispute", async function () {
      const amount = ethers.parseEther("0.3");
      await escrow
        .connect(buyer)
        .createEscrow("pX", seller.address, { value: amount });
      const orderId = 1;
      await escrow.connect(seller).acceptOrder(orderId);
      await escrow.connect(seller).markShipped(orderId);
      await escrow.connect(buyer).openDispute(orderId, "issue");
      await expect(
        escrow.connect(buyer).confirmDelivery(orderId)
      ).to.be.revertedWith("Order must be shipped first");
    });
  });
});
