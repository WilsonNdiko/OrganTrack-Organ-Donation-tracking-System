import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import { Client, PrivateKey, AccountId } from '@hashgraph/sdk';
import fs from 'fs';
import 'dotenv/config';
import fetch from 'node-fetch'; // For Mirror Node API calls

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3002;

// Hedera Configuration
let provider = null;
let wallet = null;
let organNFT = null;
let hederaClient = null;

// Mirror Node Configuration
const MIRROR_NODE_BASE_URL = 'https://testnet.mirrornode.hedera.com';

try {
  if (process.env.HEDERA_PRIVATE_KEY && process.env.HEDERA_ACCOUNT_ID) {
    console.log('🔗 Connecting to Hedera testnet...');

    // Initialize Hedera Client for validation
    try {
      const accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
      const privateKey = PrivateKey.fromStringDer(process.env.HEDERA_PRIVATE_KEY);

      hederaClient = Client.forTestnet();
      hederaClient.setOperator(accountId, privateKey);
      console.log('✅ Hedera client connected with account:', process.env.HEDERA_ACCOUNT_ID);
    } catch (clientError) {
      console.log('⚠️  Hedera client setup failed but continuing...', clientError.message);
    }

    // Setup ethers provider for smart contract interactions
    provider = new ethers.JsonRpcProvider(process.env.HEDERA_TESTNET_RPC_URL);

    // Convert DER-encoded private key to raw hex format for ethers.js
    const derPrivateKey = process.env.HEDERA_PRIVATE_KEY;
    if (derPrivateKey.startsWith('302e020100300506032b657004220420')) {
      // Extract the 32-byte private key from DER format
      const rawPrivateKey = '0x' + derPrivateKey.slice(16, 80); // Skip DER header (16 chars) and take next 64 chars (32 bytes)
      wallet = new ethers.Wallet(rawPrivateKey, provider);
      console.log('✅ Ethers wallet configured with DER-converted private key');
    } else {
      // Fall back to mock key if already in hex format
      wallet = new ethers.Wallet(derPrivateKey, provider);
      console.log('✅ Ethers wallet configured with hex private key');
    }

    // Initialize contract if address is available (otherwise use mock)
    if (process.env.CONTRACT_ADDRESS) {
      organNFT = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);
      console.log('📋 Contract initialized at:', process.env.CONTRACT_ADDRESS);
    } else {
      console.log('ℹ️  Hedera connected but no contract deployed yet - using enhanced mock mode');
    }
  } else {
    console.log('⚠️  Missing Hedera credentials, using basic mock mode');
  }
} catch (e) {
  console.error('❌ Hedera connection failed, using mock mode:', e.message);
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

// File-based persistent storage to prevent data loss
const ORGANS_FILE = './organs.json';

function loadOrgansFromFile() {
  try {
    if (fs.existsSync(ORGANS_FILE)) {
      const data = fs.readFileSync(ORGANS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      organs = parsed.organs || [];
      nextTokenId = parsed.nextTokenId || 0;
      console.log(`📁 Loaded ${organs.length} organs from persistent storage`);
    } else {
      console.log('📁 No persistent storage found, initializing with mock data');
    }
  } catch (error) {
    console.error('❌ Failed to load organs from file:', error.message);
  }
}

function saveOrgansToFile() {
  try {
    const data = JSON.stringify({
      organs,
      nextTokenId,
      lastUpdated: new Date().toISOString()
    }, null, 2);
    fs.writeFileSync(ORGANS_FILE, data);
    console.log(`💾 Saved ${organs.length} organs to persistent storage`);
  } catch (error) {
    console.error('❌ Failed to save organs to file:', error.message);
  }
}

// Initialize data
loadOrgansFromFile();

// Mock implementation (only if no data exists)
async function initializeMockData() {
  if (organs.length === 0) {
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
    saveOrgansToFile();
    console.log('🏭 Initialized with mock data and saved to persistent storage');
  }
}

initializeMockData();

// API Endpoints

// Mirror Node API functions
async function fetchTransactionInfo(txHash) {
  try {
    const response = await fetch(`${MIRROR_NODE_BASE_URL}/api/v1/transactions/${txHash}`);
    return await response.json();
  } catch (error) {
    console.error('Mirror Node fetch failed:', error);
    return null;
  }
}

// POST /createOrgan - Mint new organ NFT
app.post('/createOrgan', async (req, res) => {
  try {
    const { donor, organType, bloodType, tokenURI } = req.body;
    if (organNFT) {
      const tx = await organNFT.mintOrgan(donor, organType, bloodType, tokenURI || '');
      await tx.wait();
      res.json({ success: true, txHash: tx.hash, tokenId: nextTokenId++ });
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
      saveOrgansToFile(); // Persist data
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
    if (organNFT) {
      const tx = await organNFT.transferToHospital(tokenId, hospital);
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
      saveOrgansToFile(); // Persist data
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
    if (organNFT) {
      const tx = await organNFT.transplant(tokenId, recipient);
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
      saveOrgansToFile(); // Persist data
      res.json({ success: true, txHash: `mock_transplant_${tokenId}` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /organs - Get all organs from Mirror Node or mock data
app.get('/organs', async (req, res) => {
  try {
    if (organNFT && process.env.CONTRACT_ADDRESS) {
      // Try to fetch from Mirror Node
      const response = await fetch(`${MIRROR_NODE_BASE_URL}/api/v1/tokens/${process.env.CONTRACT_ADDRESS.split('.').pop()}/nfts?limit=100`);
      if (response.ok) {
        const data = await response.json();
        const liveOrgans = data.nfts?.map(nft => ({
          tokenId: parseInt(nft.serial_number),
          organType: nft.metadata || 'Unknown',
          bloodType: 'Unknown',
          status: 'Donated',
          createdAt: new Date(parseInt(nft.created_timestamp) / 1000000).toISOString()
        })) || [];
        res.json(liveOrgans);
        return;
      }
    }
    // Fallback to mock data
    res.json(organs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /analytics - Get live analytics from Mirror Node
app.get('/analytics', async (req, res) => {
  try {
    if (process.env.CONTRACT_ADDRESS) {
      const tokenId = process.env.CONTRACT_ADDRESS.split('.').pop();
      const [txsResponse, supplyResponse] = await Promise.all([
        fetch(`${MIRROR_NODE_BASE_URL}/api/v1/transactions?account.id=${process.env.HEDERA_ACCOUNT_ID}&limit=100&type=TOKENMINT&type=TOKENTRANSFER`),
        fetch(`${MIRROR_NODE_BASE_URL}/api/v1/tokens/${tokenId}`)
      ]);

      const txsData = txsResponse.ok ? await txsResponse.json() : null;
      const supplyData = supplyResponse.ok ? await supplyResponse.json() : null;

      const analytics = {
        totalOrgans: supplyData?.total_supply || organs.length,
        activeTransactions: txsData?.transactions?.length || 0,
        recentActivity: txsData?.transactions?.slice(0, 5) || [],
        timestamp: new Date().toISOString()
      };
      res.json(analytics);
    } else {
      // Mock analytics
      const analytics = {
        totalOrgans: organs.length,
        transplanted: organs.filter(o => o.status === 'Transplanted').length,
        inTransit: organs.filter(o => o.status === 'Transferred').length,
        total: organs.length,
        recentActivity: [],
        timestamp: new Date().toISOString()
      };
      res.json(analytics);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
