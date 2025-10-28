const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
  // Connect to Hedera testnet
  const provider = new ethers.JsonRpcProvider(process.env.HEDERA_TESTNET_RPC_URL);
  const wallet = new ethers.Wallet(process.env.HEDERA_PRIVATE_KEY, provider);

  console.log("Deploying contracts with account:", wallet.address);

  // Smart Contract ABI
  const abi = [];  // Add ABI here

  // Smart Contract Bytecode
  const bytecode = "";  // Add bytecode here

  // Deploy contract
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();
  await contract.deployed();

  console.log("OrganNFT deployed to:", contract.target);

  // Update .env with contract address
  const fs = require("fs");
  const envFile = '.env';
  let envContent = fs.readFileSync(envFile, 'utf8');
  envContent = envContent.replace(/CONTRACT_ADDRESS=/, `CONTRACT_ADDRESS=${contract.target}`);
  fs.writeFileSync(envFile, envContent);

  console.log("Deployment complete.");
}

main().catch(console.error);
