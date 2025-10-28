const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.HEDERA_TESTNET_RPC_URL);
  const wallet = new ethers.Wallet(process.env.HEDERA_PRIVATE_KEY, provider);

  const abi = [
    "function mintOrgan(address donor, string organType, string bloodType, string tokenURI) public onlyOwner returns (uint256)",
  ];

  const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

  const organs = [
    { organType: 'Heart', bloodType: 'A+', tokenURI: 'ipfs://mock1' },
    { organType: 'Kidney', bloodType: 'B-', tokenURI: 'ipfs://mock2' },
    { organType: 'Liver', bloodType: 'O+', tokenURI: 'ipfs://mock3' },
    { organType: 'Lung', bloodType: 'AB+', tokenURI: 'ipfs://mock4' },
    { organType: 'Pancreas', bloodType: 'A-', tokenURI: 'ipfs://mock5' },
    { organType: 'Eye', bloodType: 'O-', tokenURI: 'ipfs://mock6' },
  ];

  const donor = '0x' + '11111111'.repeat(10); // Mock donor address

  for (const org of organs) {
    try {
      const tx = await contract.mintOrgan(donor, org.organType, org.bloodType, org.tokenURI);
      await tx.wait();
      console.log(`Minted ${org.organType} with blood type ${org.bloodType}, TX: ${tx.hash}`);
    } catch (error) {
      console.error(`Failed to mint ${org.organType}:`, error.message);
    }
  }

  console.log('Mock data generation complete.');
}

main().catch(console.error);
