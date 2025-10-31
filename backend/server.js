import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import { Client, PrivateKey, AccountId } from '@hashgraph/sdk';
import fs from 'fs';
import 'dotenv/config';
import fetch from 'node-fetch'; // For Mirror Node API calls
import { createClient } from '@supabase/supabase-js';

const app = express();

// Configure CORS to allow requests from Vercel and localhost
const corsOptions = {
  origin: [
    'https://organ-track-organ-donation-tracking.vercel.app',
    'http://localhost:3000',
    'http://localhost:8080',
    'http://localhost:3002'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

const port = process.env.PORT || 3002;

// Supabase Configuration
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  console.log('🗄️  Supabase database connected');
} else {
  console.log('📁 Using JSON file storage (no Supabase configured)');
}

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
let ledger = []; // Ledger storage for tracking all events
let requests = []; // Organ requests storage

// File-based persistent storage to prevent data loss
const ORGANS_FILE = './organs.json';
const LEDGER_FILE = './ledger.json';
const REQUESTS_FILE = './requests.json';

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

// Supabase database functions
async function loadOrgansFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('organs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map Supabase field names to frontend expected field names
    organs = (data || []).map(organ => ({
      tokenId: organ.token_id,
      organType: organ.organ_type,
      bloodType: organ.blood_type,
      status: organ.status,
      donor: organ.donor,
      hospital: organ.hospital,
      recipient: organ.recipient,
      tokenURI: organ.token_uri,
      createdAt: organ.created_at
    }));

    nextTokenId = Math.max(...organs.map(o => o.tokenId || 0), 0) + 1;
    console.log(`🗄️  Loaded ${organs.length} organs from Supabase`);
  } catch (error) {
    console.error('❌ Failed to load organs from Supabase:', error.message);
  }
}

async function saveOrganToSupabase(organ) {
  try {
    const { error } = await supabase
      .from('organs')
      .insert([{
        token_id: organ.tokenId,
        organ_type: organ.organType,
        blood_type: organ.bloodType,
        status: organ.status,
        donor: organ.donor,
        token_uri: organ.tokenURI,
        hospital: organ.hospital,
        recipient: organ.recipient,
        created_at: new Date(organ.createdAt).toISOString()
      }]);

    if (error) throw error;
    console.log(`💾 Saved organ ${organ.tokenId} to Supabase`);
  } catch (error) {
    console.error('❌ Failed to save organ to Supabase:', error.message);
  }
}

async function updateOrganInSupabase(tokenId, updates) {
  try {
    const { error } = await supabase
      .from('organs')
      .update({
        status: updates.status,
        hospital: updates.hospital,
        recipient: updates.recipient
      })
      .eq('token_id', tokenId);

    if (error) throw error;
    console.log(`📝 Updated organ ${tokenId} in Supabase`);
  } catch (error) {
    console.error('❌ Failed to update organ in Supabase:', error.message);
  }
}

// Organ Requests database functions
async function createOrganRequestInSupabase(request) {
  try {
    const { error } = await supabase
      .from('organ_requests')
      .insert([{
        request_id: request.requestId,
        organ_id: request.organId,
        requesting_hospital: request.requestingHospital,
        owning_hospital: request.owningHospital || 'General Hospital',
        status: request.status || 'pending',
        requester_address: request.requesterAddress || null
      }]);

    if (error) throw error;
    console.log(`📨 Created organ request ${request.requestId} in Supabase`);
  } catch (error) {
    console.error('❌ Failed to create organ request in Supabase:', error.message);
  }
}

async function getOrganRequestsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('organ_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map Supabase field names to frontend expected field names
    const mappedRequests = (data || []).map(request => ({
      id: request.id,
      requestId: request.request_id,
      organId: request.organ_id,
      requestingHospital: request.requesting_hospital,
      owningHospital: request.owning_hospital,
      status: request.status,
      requesterAddress: request.requester_address,
      createdAt: request.created_at,
      updatedAt: request.updated_at
    }));

    console.log(`📋 Retrieved ${mappedRequests.length} organ requests from Supabase`);
    return mappedRequests;
  } catch (error) {
    console.error('❌ Failed to get organ requests from Supabase:', error.message);
    return [];
  }
}

async function updateOrganRequestInSupabase(requestId, updates) {
  try {
    const { error } = await supabase
      .from('organ_requests')
      .update({
        status: updates.status
      })
      .eq('request_id', requestId);

    if (error) throw error;
    console.log(`📝 Updated organ request ${requestId} status to ${updates.status}`);
  } catch (error) {
    console.error('❌ Failed to update organ request in Supabase:', error.message);
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

// Requests file-based storage functions
function loadRequestsFromFile() {
  try {
    if (fs.existsSync(REQUESTS_FILE)) {
      const data = fs.readFileSync(REQUESTS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      requests = parsed.requests || [];
      console.log(`📋 Loaded ${requests.length} organ requests from persistent storage`);
    } else {
      console.log('📋 No requests file found, initializing empty requests');
    }
  } catch (error) {
    console.error('❌ Failed to load requests from file:', error.message);
  }
}

function saveRequestsToFile() {
  try {
    const data = JSON.stringify({
      requests,
      lastUpdated: new Date().toISOString()
    }, null, 2);
    fs.writeFileSync(REQUESTS_FILE, data);
    console.log(`💾 Saved ${requests.length} organ requests to persistent storage`);
  } catch (error) {
    console.error('❌ Failed to save requests to file:', error.message);
  }
}

// Ledger functions
function loadLedgerFromFile() {
  try {
    if (fs.existsSync(LEDGER_FILE)) {
      const data = fs.readFileSync(LEDGER_FILE, 'utf8');
      const parsed = JSON.parse(data);

      // Handle both formats: direct array or { ledger: [...] }
      if (Array.isArray(parsed)) {
        ledger = parsed;
      } else {
        ledger = parsed.ledger || [];
      }

      console.log(`📖 Loaded ${ledger.length} ledger events from persistent storage`);
    } else {
      console.log('📖 No ledger file found, initializing empty ledger');
    }
  } catch (error) {
    console.error('❌ Failed to load ledger from file:', error.message);
  }
}

function saveLedgerToFile() {
  try {
    const data = JSON.stringify({
      ledger,
      lastUpdated: new Date().toISOString()
    }, null, 2);
    fs.writeFileSync(LEDGER_FILE, data);
    console.log(`📝 Saved ${ledger.length} ledger events to persistent storage`);
  } catch (error) {
    console.error('❌ Failed to save ledger to file:', error.message);
  }
}

function recordLedgerEvent(event) {
  const ledgerEvent = {
    id: `LEDGER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...event,
    timestamp: event.timestamp || new Date().toISOString(),
    txHash: event.txHash || `mock_${event.type}_${event.organId || 'unknown'}`
  };

  ledger.push(ledgerEvent);
  saveLedgerToFile();
  console.log(`📋 Recorded ledger event: ${event.type} for organ ${event.organId || 'unknown'}`);
}

// Initialize data
if (supabase) {
  loadOrgansFromSupabase();
} else {
  loadOrgansFromFile();
}

loadLedgerFromFile(); // Load ledger data
loadRequestsFromFile(); // Load requests data

// Mock implementation (only if no data exists)
async function initializeMockData() {
  if (organs.length === 0) {
    const hospitalNames = [
      'St. Mary\'s General Hospital',
      'City Medical Center',
      'University Hospital',
      'Regional Health Center',
      'Metropolitan Medical Group'
    ];

    const mockOrgans = [
      { organType: 'Heart', bloodType: 'A+', status: 'Donated' },
      { organType: 'Kidney', bloodType: 'B-', status: 'Transferred' },
      { organType: 'Liver', bloodType: 'O+', status: 'Transplanted' },
      { organType: 'Lung', bloodType: 'AB-', status: 'Donated' },
      { organType: 'Pancreas', bloodType: 'A-', status: 'Requested' },
    ];

    organs = mockOrgans.map((o, i) => ({
      tokenId: i,
      ...o,
      donor: `0x${(i + 1).toString().padStart(40, '1')}`, // Proper hex format
      hospital: i % 2 === 0 ? hospitalNames[i % hospitalNames.length] : null,
      recipient: i === 2 ? `0x${(i + 10).toString().padStart(40, '2')}` : null,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(), // Always ISO string
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
    const { donor, organType, bloodType, tokenURI, hospital, recipientName, recipientBloodType, recipientContact } = req.body;
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
        createdAt: new Date().toISOString(), // Always ISO string
        hospital: hospital || null, // Include hospital from request
        recipient: null,
      };
      organs.push(organ);

      // Save to Supabase if available, otherwise to file
      if (supabase) {
        await saveOrganToSupabase(organ);
      } else {
        saveOrgansToFile();
      }

      // Record in ledger
      recordLedgerEvent({
        type: 'OrganRegistered',
        organId: organ.tokenId,
        organType: organ.organType,
        bloodType: organ.bloodType,
        hospital: organ.hospital,
        donor: organ.donor,
        recipient: recipientName || 'Pending',
        timestamp: new Date().toISOString(),
        details: `Organ ${organ.organType} (${organ.bloodType}) registered at ${organ.hospital} for recipient ${recipientName || 'Pending'}`
      });

      res.json({ success: true, txHash: `mock_${organ.tokenId}`, tokenId: organ.tokenId });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /transferOrgan - Transfer organ to hospital or mark as arrived
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
      if (!organ) {
        return res.status(400).json({ error: 'Organ not found' });
      }

      // Check if this is an arrival (organ is in transit and staying at same hospital)
      const isArrival = organ.status === 'Transferred' && organ.hospital === hospital;

      if (isArrival) {
        // Mark as arrived - change status to "Donated" (Available)
        organ.status = 'Donated';

        // Record arrival in ledger
        recordLedgerEvent({
          type: 'organ_arrived',
          organId: tokenId,
          organType: organ.organType,
          hospital: hospital,
          timestamp: new Date().toISOString(),
          details: `Organ ${organ.organType} (${tokenId}) arrived at ${hospital} and is now available`
        });
      } else {
        // Regular transfer - only allow if organ is available (Donated) or requested
        if (organ.status !== 'Donated' && organ.status !== 'Requested') {
          return res.status(400).json({ error: 'Invalid transfer - organ must be available or requested' });
        }
        organ.status = 'Transferred';
        organ.hospital = hospital;

        // Record transfer in ledger
        recordLedgerEvent({
          type: 'organ_transferred',
          organId: tokenId,
          organType: organ.organType,
          hospital: hospital,
          timestamp: new Date().toISOString(),
          details: `Organ ${organ.organType} (${tokenId}) transferred to ${hospital}`
        });
      }

      // Update in Supabase if available, otherwise save to file
      if (supabase) {
        await updateOrganInSupabase(tokenId, { status: organ.status, hospital: organ.hospital });
      } else {
        saveOrgansToFile();
      }

      res.json({ success: true, txHash: `mock_${isArrival ? 'arrival' : 'transfer'}_${tokenId}` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /transplantOrgan - Transplant organ to recipient
app.post('/transplantOrgan', async (req, res) => {
  try {
    const { tokenId, recipient, recipientName, recipientAge, recipientBloodType, recipientHospital, receiptNumber, transplantDate, surgeon, notes } = req.body;
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
      organ.recipientDetails = {
        name: recipientName,
        age: recipientAge,
        bloodType: recipientBloodType,
        hospital: recipientHospital,
        transplantDate: transplantDate || new Date().toISOString(),
        surgeon: surgeon,
        notes: notes
      };

      // Update in Supabase if available, otherwise save to file
      if (supabase) {
        await updateOrganInSupabase(tokenId, {
          status: 'Transplanted',
          recipient,
          recipientDetails: organ.recipientDetails
        });
      } else {
        saveOrgansToFile();
      }

      // Record in ledger
      recordLedgerEvent({
        type: 'OrganTransplanted',
        organId: tokenId,
        organType: organ.organType,
        bloodType: organ.bloodType,
        donor: organ.donor,
        hospital: recipientHospital,
        recipient: recipientName,
        surgeon: surgeon,
        receiptNumber: receiptNumber,
        transplantDate: transplantDate,
        timestamp: new Date().toISOString(),
        details: `Organ ${organ.organType} (${organ.bloodType}) transplanted to ${recipientName} at ${recipientHospital} by ${surgeon}`
      });

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
        const liveOrgans = data.nfts?.map(nft => {
          const tokenId = parseInt(nft.serial_number);

          // Try to find enriched data from Supabase/local storage
          const enrichedData = organs.find(o => o.tokenId === tokenId);

          return {
            tokenId,
            organType: enrichedData?.organType || nft.metadata || 'Unknown',
            bloodType: enrichedData?.bloodType || 'Unknown',
            status: enrichedData?.status || 'Donated',
            donor: enrichedData?.donor || null,
            hospital: enrichedData?.hospital || null,
            recipient: enrichedData?.recipient || null,
            tokenURI: enrichedData?.tokenURI || null,
            createdAt: enrichedData?.createdAt
              ? (typeof enrichedData.createdAt === 'number'
                  ? new Date(enrichedData.createdAt).toISOString()
                  : enrichedData.createdAt)
              : new Date(parseInt(nft.created_timestamp) / 1000000).toISOString()
          };
        }) || [];

        console.log(`🔗 Retrieved ${liveOrgans.length} organs from Hedera Mirror Node with enriched data`);
        res.json(liveOrgans);
        return;
      }
    }

    // Fallback to mock data - ensure createdAt is ISO string and all fields are included
    const formattedOrgans = organs.map(organ => ({
      tokenId: organ.tokenId,
      organType: organ.organType,
      bloodType: organ.bloodType,
      status: organ.status,
      donor: organ.donor,
      hospital: organ.hospital,
      recipient: organ.recipient,
      tokenURI: organ.tokenURI,
      createdAt: typeof organ.createdAt === 'number'
        ? new Date(organ.createdAt).toISOString()
        : organ.createdAt
    }));

    console.log(`📁 Retrieved ${formattedOrgans.length} organs from local/Supabase storage`);
    res.json(formattedOrgans);
  } catch (error) {
    console.error('❌ Failed to fetch organs:', error);
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

// POST /createOrganRequest - Create a new organ transfer request
app.post('/createOrganRequest', async (req, res) => {
  try {
    const { organId, requestingHospital, owningHospital, requesterAddress } = req.body;

    if (!organId || !requestingHospital) {
      return res.status(400).json({ error: 'Missing required fields: organId and requestingHospital' });
    }

    const request = {
      requestId: `REQ-${String(Date.now()).slice(-6)}`,
      organId: parseInt(organId),
      requestingHospital,
      owningHospital: owningHospital || 'General Hospital',
      status: 'pending',
      requesterAddress,
      createdAt: new Date().toISOString()
    };

    // Update organ status to Requested and save request
    if (supabase) {
      await updateOrganInSupabase(organId, { status: 'Requested' });
      await createOrganRequestInSupabase(request);
    } else {
      // Update organ status in file storage
      const organ = organs.find(o => o.tokenId === parseInt(organId));
      if (organ) {
        organ.status = 'Requested';
        saveOrgansToFile();
      }
      // Save request to file storage
      requests.push(request);
      saveRequestsToFile();
    }

    res.json({ success: true, requestId: request.requestId, message: 'Organ transfer request created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /organRequests - Get all organ requests
app.get('/organRequests', async (req, res) => {
  try {
    let requestsData = [];

    if (supabase) {
      requestsData = await getOrganRequestsFromSupabase();
    } else {
      // Return requests from file storage
      requestsData = requests.map(request => ({
        id: request.requestId, // Use requestId as id for frontend compatibility
        requestId: request.requestId,
        organId: request.organId,
        requestingHospital: request.requestingHospital,
        owningHospital: request.owningHospital,
        status: request.status,
        requesterAddress: request.requesterAddress,
        createdAt: request.createdAt,
        updatedAt: request.createdAt // Use createdAt as updatedAt for file storage
      }));
    }

    console.log(`📋 Retrieved ${requestsData.length} organ requests`);
    res.json(requestsData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /updateOrganRequest - Accept or reject organ request
app.put('/updateOrganRequest', async (req, res) => {
  try {
    const { requestId, status, organId } = req.body;

    if (!requestId || !status || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Missing required fields or invalid status. Must provide requestId and status (accepted or rejected)' });
    }

    if (supabase) {
      await updateOrganRequestInSupabase(requestId, { status });

      // If accepted, update organ status and transfer it
      if (status === 'accepted' && organId) {
        const requestData = await getOrganRequestsFromSupabase();
        const request = requestData.find(r => r.request_id === requestId);

        if (request) {
          await updateOrganInSupabase(organId, {
            status: 'Transferred',
            hospital: request.requesting_hospital
          });
        }
      } else if (status === 'rejected' && organId) {
        // If rejected, reset organ status to Donated
        await updateOrganInSupabase(organId, { status: 'Donated' });
      }
    } else {
      // Update request in file storage
      const requestIndex = requests.findIndex(r => r.requestId === requestId);
      if (requestIndex !== -1) {
        requests[requestIndex].status = status;
        saveRequestsToFile();

        // Update organ status based on request action
        if (status === 'accepted' && organId) {
          const organ = organs.find(o => o.tokenId === parseInt(organId));
          if (organ) {
            organ.status = 'Transferred';
            organ.hospital = requests[requestIndex].requestingHospital;
            saveOrgansToFile();
          }
        } else if (status === 'rejected' && organId) {
          // Reset organ status to Donated
          const organ = organs.find(o => o.tokenId === parseInt(organId));
          if (organ) {
            organ.status = 'Donated';
            saveOrgansToFile();
          }
        }
      }
    }

    res.json({ success: true, message: `Request ${requestId} has been ${status}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /clearOrgans - Clear all existing organs (for development/testing)
app.delete('/clearOrgans', async (req, res) => {
  try {
    organs = [];
    nextTokenId = 0;
    requests = []; // Clear requests array

    // Clear file storage
    if (fs.existsSync(ORGANS_FILE)) {
      fs.unlinkSync(ORGANS_FILE);
    }
    if (fs.existsSync(REQUESTS_FILE)) {
      fs.unlinkSync(REQUESTS_FILE);
    }

    // Clear Supabase if available
    if (supabase) {
      await supabase.from('organs').delete().neq('token_id', -1); // Delete all records
      await supabase.from('organ_requests').delete().neq('id', -1); // Also clear requests
    }

    console.log('🗑️  Cleared all existing organs and requests - database is now empty');
    res.json({
      success: true,
      message: 'All organs and requests cleared - database is now completely empty',
      organsCount: 0
    });
  } catch (error) {
    console.error('❌ Failed to clear organs:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /debug - Debug endpoint to check data sources
app.get('/debug', async (req, res) => {
  // Force reload from Supabase to check current state
  if (supabase) {
    try {
      await loadOrgansFromSupabase();
    } catch (error) {
      console.error('Debug: Failed to reload from Supabase:', error);
    }
  }

  res.json({
    supabaseConfigured: !!supabase,
    supabaseUrl: process.env.SUPABASE_URL ? 'configured' : 'missing',
    supabaseKey: process.env.SUPABASE_ANON_KEY ? 'configured' : 'missing',
    organsCount: organs.length,
    organsSource: supabase ? 'supabase' : 'file',
    organsSample: organs.slice(0, 2), // First 2 organs for debugging (mapped data)
    rawOrgansSample: organs.slice(0, 2), // Show what frontend actually gets
    ledgerCount: ledger.length,
    ledgerSample: ledger.slice(0, 2),
    nextTokenId,
    timestamp: new Date().toISOString()
  });
});

// GET /ledger - Get all ledger events
app.get('/ledger', (req, res) => {
  try {
    // Sort ledger events by timestamp (most recent first)
    const sortedLedger = ledger.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    console.log(`📖 Retrieved ${sortedLedger.length} ledger events`);
    res.json(sortedLedger);
  } catch (error) {
    console.error('❌ Failed to fetch ledger:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /health - Simple health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'OrgFlow API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
