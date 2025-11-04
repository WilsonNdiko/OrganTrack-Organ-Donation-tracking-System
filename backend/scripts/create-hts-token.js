import {
  Client,
  PrivateKey,
  AccountId,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  AccountBalanceQuery,
  Hbar
} from "@hashgraph/sdk";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🚀 Creating HTS Token for Organ NFTs...");

  // Check environment variables
  if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
    throw new Error("❌ Missing Hedera credentials. Please check HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY in .env");
  }

  try {
    // Set up Hedera client
    const accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
    const privateKey = PrivateKey.fromStringDer(process.env.HEDERA_PRIVATE_KEY);

    const client = Client.forNetwork({
      "0.testnet.hedera.com:50211": "0.0.3",
      "1.testnet.hedera.com:50211": "0.0.4",
      "2.testnet.hedera.com:50211": "0.0.5",
      "3.testnet.hedera.com:50211": "0.0.6"
    }).setOperator(accountId, privateKey);

    console.log("✅ Connected to Hedera testnet with account:", accountId.toString());

    // Check account balance
    console.log("💰 Checking account balance...");
    const accountBalance = await new AccountBalanceQuery()
      .setAccountId(accountId)
      .execute(client);

    console.log("   Account Balance:", accountBalance.hbars.toString());

    // Create HTS Token for Organ NFTs
    console.log("🏗️  Creating HTS Token for Organ NFTs...");

    const tokenCreateTx = await new TokenCreateTransaction()
      .setTokenName("OrganNFT")
      .setTokenSymbol("ORGAN")
      .setTokenType(TokenType.NonFungibleUnique)
      .setSupplyType(TokenSupplyType.Infinite)
      .setTreasuryAccountId(accountId)
      .setAdminKey(privateKey.publicKey)
      .setSupplyKey(privateKey.publicKey)
      .setMaxTransactionFee(new Hbar(10))
      .freezeWith(client);

    // Sign and execute the transaction
    const tokenCreateSign = await tokenCreateTx.sign(privateKey);
    const tokenCreateSubmit = await tokenCreateSign.execute(client);
    const tokenCreateReceipt = await tokenCreateSubmit.getReceipt(client);

    if (!tokenCreateReceipt.tokenId) {
      throw new Error("Token creation failed - no token ID received");
    }

    const tokenId = tokenCreateReceipt.tokenId;
    const tokenIdString = tokenId.toString();

    console.log("✅ HTS Token created successfully!");
    console.log("🪙 Token Details:");
    console.log("   Token ID:", tokenIdString);
    console.log("   Token Name: OrganNFT");
    console.log("   Token Symbol: ORGAN");
    console.log("   Token Type: Non-Fungible Unique");
    console.log("   Hedera Explorer: https://hashscan.io/testnet/token/", tokenIdString);

    // Update .env with token ID
    const envFile = '.env';
    let envContent = fs.readFileSync(envFile, 'utf8');

    // Replace or add TOKEN_ID
    if (envContent.includes('TOKEN_ID=')) {
      envContent = envContent.replace(/TOKEN_ID=.*/, `TOKEN_ID=${tokenIdString}`);
    } else {
      envContent += `\n# HTS Token ID for organ NFTs\nTOKEN_ID=${tokenIdString}\n`;
    }

    fs.writeFileSync(envFile, envContent);

    console.log("📝 Updated .env with HTS Token ID");

    // Test minting an NFT to verify the token works
    console.log("🧪 Testing token by minting a sample NFT...");

    const metadata = Buffer.from(JSON.stringify({
      name: "Test Organ",
      type: "Heart",
      blood: "A+",
      date: new Date().toISOString().split('T')[0]
    }));

    const mintTx = await new TokenMintTransaction()
      .setTokenId(tokenId)
      .setMetadata([metadata])
      .setMaxTransactionFee(new Hbar(10))
      .freezeWith(client);

    const mintSign = await mintTx.sign(privateKey);
    const mintSubmit = await mintSign.execute(client);
    const mintReceipt = await mintSubmit.getReceipt(client);

    const serialNumbers = mintReceipt.serials;
    console.log("✅ Test NFT minted successfully!");
    console.log("   Serial Number:", serialNumbers[0].toString());

    console.log("\n🎉 HTS Token creation and testing complete!");
    console.log("📧 Ready to use HTS for organ NFTs");
    console.log("🔄 Please restart the backend server to load the new TOKEN_ID");

    return tokenIdString;

  } catch (error) {
    console.error("❌ HTS Token creation failed:", error.message);
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
    console.error("❌ HTS Token creation failed:", error);
    process.exit(1);
  });
