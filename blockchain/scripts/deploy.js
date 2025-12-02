const hre = require("hardhat");

async function main() {
  console.log("Deploying Escrow contract...");

  const Escrow = await hre.ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy();

  await escrow.waitForDeployment();

  const address = await escrow.getAddress();
  console.log("Escrow Contract deployed at:", address);
  console.log("\nCopy this address to:");
  console.log("- frontend/utils/contractAddress.ts");
  console.log("- backend/src/config/contract.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
