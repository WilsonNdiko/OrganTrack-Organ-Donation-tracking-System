import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3002;

// Hedera RPC provider
let provider = null;
let wallet = null;
try {
  if (process.env.HEDERA_PRIVATE_KEY && !process.env.HEDERA_PRIVATE_KEY.startsWith('X')) {
    provider = new ethers.JsonRpcProvider(process.env.HEDERA_TESTNET_RPC_URL);
    wallet = new ethers.Wallet(process.env.HEDERA_PRIVATE_KEY, provider);
  }
} catch (e) {
  console.log('Using mock mode');
}

// Contract ABI (placeholder - add actual ABI)
const abi = [
  "function mintOrgan(address donor, string organType, string bloodType, string tokenURI) public onlyOwner returns (uint256)",
  "function transferToHospital(uint256 tokenId, address hospital) public",
  "function transplant(uint256 tokenId, address recipient) public",
  "function getOrgan(uint256 tokenId) public view returns (string memory, string memory, uint256, uint8)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
];

let organs = []; // Mock storage
let nextTokenId = 0;

const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = contractAddress ? new ethers.Contract(contractAddress, abi, wallet) : null;

// Mock implementation
async function initializeMockData() {
  const mockOrgans = [
    { organType: 'Heart', bloodType: 'A+', status: 'Donated' },
    { organType: 'Kidney', bloodType: 'B-', status: 'Transferred' },
    { organType: 'Liver', bloodType: 'O+', status: 'Transplanted' },
  ];
  organs = mockOrgans.map((o, i) => ({
    tokenId: i,
    ...o,
    donor: '0x' + '1'.repeat(40),
    hospital: i % 2 === 0 ? '0x' + '2'.repeat(40) : null,
    recipient: i === 2 ? '0x' + '3'.repeat(40) : null,
    createdAt: Date.now() - i * 86400000, // Days ago
  }));
  nextTokenId = mockOrgans.length;
}

initializeMockData();

// API Endpoints

// POST /createOrgan - Mint new organ NFT
app.post('/createOrgan', async (req, res) => {
  try {
    const { donor, organType, bloodType, tokenURI } = req.body;
    if (contract) {
      const tx = await contract.mintOrgan(donor, organType, bloodType, tokenURI);
      await tx.wait();
      res.json({ success: true, txHash: tx.hash, tokenId: nextTokenId });
    } else {
      // Mock
      const organ = {
        tokenId: nextTokenId++,
        organType,
        bloodType,
        status: 'Donated',
        donor,
        tokenURI,
        createdAt: Date.now(),
        hospital: null,
        recipient: null,
      };
      organs.push(organ);
      res.json({ success: true, txHash: `mock_${organ.tokenId}`, tokenId: organ.tokenId });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /transferOrgan - Transfer organ to hospital
app.post('/transferOrgan', async (req, res) => {
  try {
    const { tokenId, hospital } = req.body;
    if (contract) {
      const tx = await contract.transferToHospital(tokenId, hospital);
      await tx.wait();
      res.json({ success: true, txHash: tx.hash });
    } else {
      // Mock
      const organ = organs.find(o => o.tokenId === tokenId);
      if (!organ || organ.status !== 'Donated') {
        return res.status(400).json({ error: 'Invalid transfer' });
      }
      organ.status = 'Transferred';
      organ.hospital = hospital;
      res.json({ success: true, txHash: `mock_transfer_${tokenId}` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /transplantOrgan - Transplant organ to recipient
app.post('/transplantOrgan', async (req, res) => {
  try {
    const { tokenId, recipient } = req.body;
    if (contract) {
      const tx = await contract.transplant(tokenId, recipient);
      await tx.wait();
      res.json({ success: true, txHash: tx.hash });
    } else {
      // Mock
      const organ = organs.find(o => o.tokenId === tokenId);
      if (!organ || organ.status !== 'Transferred') {
        return res.status(400).json({ error: 'Invalid transplant' });
      }
      organ.status = 'Transplanted';
      organ.recipient = recipient;
      res.json({ success: true, txHash: `mock_transplant_${tokenId}` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
