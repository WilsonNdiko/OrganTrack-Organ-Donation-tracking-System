const { PrivateKey } = require("@hashgraph/sdk");

async function main() {
  // Generate ED25519 private key (for accounts)
  const privateKeyED = PrivateKey.generateED25519();
  console.log("ED25519 Private Key:", privateKeyED.toString());
  console.log("ED25519 Public Key:", privateKeyED.publicKey.toString());

  // For smart contracts, ECDSA is supported
  const privateKeyEC = PrivateKey.generateECDSA();
  console.log("ECDSA Private Key:", privateKeyEC.toString());
  console.log("ECDSA Public Key:", privateKeyEC.publicKey.toString());

  // Note: To create a testnet account, you need existing HBAR.
  // Use Hedera Developer Faucet or transfer from another account.
  // Example: Create account with code (requires crypto transfer from existing account)

  // const client = ...
  // const newAccount = await new AccountCreateTransaction()...
}

main().catch(console.error);
