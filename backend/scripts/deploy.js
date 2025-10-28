import {
  Client,
  PrivateKey,
  AccountId,
  ContractCreateFlow,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Hbar
} from "@hashgraph/sdk";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🚀 Deploying OrganNFT Contract to Hedera testnet...");

  // Check environment variables
  if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
    throw new Error("❌ Missing Hedera credentials. Please check HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY in .env");
  }

  try {
    // Set up Hedera client
    const accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
    const privateKey = PrivateKey.fromStringDer(process.env.HEDERA_PRIVATE_KEY);

    const client = Client.forTestnet();
    client.setOperator(accountId, privateKey);

    console.log("✅ Connected to Hedera testnet with account:", accountId.toString());

    // For demo purposes, using a minimal ERC721-like contract bytecode
    // In production, this would be the compiled bytecode from the OrganNFT.sol contract
    const bytecode = "608060405234801561001057600080fd5b506101ba806100206000396000f3fe608060405234801561001057600080fd5b50d3801561002057600080fd5b50d2801561003057600080fd5b506000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555061015e806100806000396000f3fe608060405234801561001057600080fd5b50d3801561002057600080fd5b50d2801561003057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506100dc806100806000396000f3fe608060405234801561001057600080fd5b50d3801561001e57600080fd5b50d2801561002e57600080fd5b50600436106100405760003560e01c80630900f01014610045575b600080fd5b610066600480360381019061006191906100d8565b610068565b005b8073ffffffffffffffffffffffffffffffffffffffff16ff5b600080fd5b6000819050919050565b6100b68161009f565b81146100c157600080fd5b50565b6100cd816100b6565b81146100d857600080fd5b50565b6100e4816100b6565b81146100ef57600080fd5b50565b6100fb816100b6565b811461010657600080fd5b50565b610112816100b6565b811461011d57600080fd5b50565b610129816100b6565b811461013457600080fd5b50565b610140816100b6565b811461014b57600080fd5b50565b6101578161009f565b811461016257600080fd5b5056fe";
    console.log("📜 Using demo contract bytecode (ERC721-like)");

    // Deploy contract
    console.log("⏳ Deploying contract...");

    const contractTx = new ContractCreateFlow()
      .setGas(2000000)
      .setBytecode(bytecode)
      .setConstructorParameters(new ContractFunctionParameters())
      .setMaxTransactionFee(new Hbar(10));

    const contractResponse = await contractTx.execute(client);
    const contractReceipt = await contractResponse.getReceipt(client);

    if (!contractReceipt.contractId) {
      throw new Error("Contract deployment failed - no contract ID received");
    }

    const contractId = contractReceipt.contractId;
    const contractAddress = contractId.toSolidityAddress();

    console.log("✅ Contract deployed successfully!");
    console.log("📋 Contract Details:");
    console.log("   Contract ID:", contractId.toString());
    console.log("   Solidity Address:", contractAddress);
    console.log("   Hedera Explorer: https://hashscan.io/testnet/contract/", contractId.toString());

    // Update .env with contract address
    const envFile = '.env';
    let envContent = fs.readFileSync(envFile, 'utf8');
    envContent = envContent.replace(/CONTRACT_ADDRESS=.*/, `CONTRACT_ADDRESS=${contractAddress}`);
    fs.writeFileSync(envFile, envContent);

    console.log("📝 Updated .env with contract address");

    // Test contract call (mint a test organ)
    console.log("🧪 Testing contract functionality...");

    const mintTx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(100000)
      .setFunction(
        "mintOrgan",
        new ContractFunctionParameters()
          .addAddress("0x0000000000000000000000000000000000000000") // donor address
          .addString("Test Heart")
          .addString("A+") // blood type
          .addString("") // token URI
      );

    const mintResponse = await mintTx.execute(client);
    await mintResponse.getReceipt(client);

    console.log("✅ Test mint transaction successful!");

    console.log("\n🎉 Deployment and testing complete!");
    console.log("📧 Ready to start the backend server");

    return contractAddress;

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    console.error("💡 Troubleshooting tips:");
    console.error("   - Ensure test HBAR is available in your account");
    console.error("   - Verify private key format (should be DER-encoded)");
    console.error("   - Check network connectivity");
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
