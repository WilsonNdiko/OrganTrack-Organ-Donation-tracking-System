# 🖧 OrgFlow Backend API

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![Hedera](https://img.shields.io/badge/Hedera-00A3B6?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIHN0cm9rZT0iIzAwQTNCNiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Im0xNCA3aC00YTIgMiAwIDAgMC0yLTJ2NGEyIDIgMCAwMDIgMmg0YTIgMiAwIDAwMi0ydi00YTIgMiAwIDAwLTItMnoiLz4KPHBhdGggZD0ibTEwIDE0djdoLTRhMiAyIDAgMDAtMi0ydi00YTIgMiAwIDAyIDJ2NGg0YTIgMiAwIDAyIDItMnoiLz4KCjwvc3ZnPg==)](https://hedera.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)

**Express.js API server that powers the OrgFlow organ donation platform with Hedera Hashgraph blockchain integration.**

## 🎯 Overview

The backend provides RESTful API endpoints for complete organ NFT lifecycle management, multi-hospital coordination, and real-time blockchain tracking. Built with enterprise-grade security and performance for critical medical operations.

## 🚀 Quick Start

### Prerequisites
```bash
Node.js ≥ 18.0
npm ≥ 8.0
MongoDB ≥ 5.0 (optional, uses JSON file by default)
```

### Environment Setup

1. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Configure Hedera credentials:**
   - Get testnet account from [Hedera Developer Portal](https://portal.hedera.com/)
   - Add `HEDERA_ACCOUNT_ID` and `HEDERA_PRIVATE_KEY` to `.env`

3. **Set up Supabase Database (Recommended):**
   ```bash
   # Run the interactive setup script
   node setup-supabase.js

   # Or manually configure in .env:
   # SUPABASE_URL=https://your-project.supabase.co
   # SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Create Database Tables:**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Run the SQL to create tables and indexes

5. **Install dependencies:**
   ```bash
   npm install
   ```

6. **Generate cryptographic keys:**
   ```bash
   npm run generate-keys
   ```

## 🏗️ Architecture

```
┌──────────────────┐    HTTP/HTTPS    ┌────────────────┐
│   React Frontend  │◄────────────────►│  Express API   │
│   (Port 8081)     │                  │   (Port 3002)  │
└──────────────────┘                  └────────────────┘
          │                                       │
          │ WebSocket (optional)                  │
          │                                       │
          ▼                                       ▼
┌──────────────────┐                   ┌──────────────────────┐
│   Web Browsers    │                   │   Hedera Hashgraph    │
│   Mobile Apps     │                   │   Smart Contracts     │
└──────────────────┘                   │   Testnet/Mainnet     │
                                       └──────────────────────┘
                                               │
                                               ▼
                                   ┌──────────────────────┐
                                   │   JSON File Storage   │
                                   │   organs.json        │
                                   └──────────────────────┘
```

## ⚙️ Configuration

### Environment Variables (.env)

```env
# Server Configuration
PORT=3002
NODE_ENV=development

# Hedera Network
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY
HEDERA_PUBLIC_KEY=YOUR_PUBLIC_KEY

# Database (Optional - defaults to JSON file)
MONGODB_URI=mongodb://localhost:27017/orgflow
USE_MONGODB=false

# Security
JWT_SECRET=your-jwt-secret-key
API_KEY=your-api-key
CORS_ORIGIN=http://localhost:8081

# Smart Contract
CONTRACT_ADDRESS=0.0.YOUR_CONTRACT_ID

# Logging
LOG_LEVEL=info
LOG_FILE=logs/backend.log
```

## 🚀 Deployment & Setup

### 1. Hedera Account Setup

```bash
# Get test HBAR from Hedera faucet
# https://portal.hedera.com/faucet
```

### 2. Smart Contract Deployment

1. **Compile OrganNFT contract:**
   ```bash
   npx hardhat compile
   ```

2. **Deploy to Hedera:**
   ```bash
   npx hardhat run scripts/deploy.js --network hedera-testnet
   ```

3. **Update contract address in `.env`:**
   ```env
   CONTRACT_ADDRESS=0.0.1234567
   ```

### 3. Generate Test Data

```bash
# Generate sample organ NFTs
npm run generate-mock

# Generate additional test data
npm run generate-mock-data
```

### 4. Start Server

```bash
# Development
npm run dev

# Production
npm start

# Docker (if available)
docker build -t orgflow-backend .
docker run -p 3002:3002 orgflow-backend
```

## 📡 API Endpoints

### 🏥 Organ Management

#### Create Organ NFT
```http
POST /api/organs
Content-Type: application/json

{
  "organType": "Heart",
  "bloodType": "A+",
  "donor": {
    "name": "John Doe",
    "age": 45,
    "hospital": "St. Mary's Hospital",
    "medicalNotes": "No contraindications"
  },
  "metadata": {
    "weight": 350,
    "hla": "A2,B7,DR4",
    "urgency": "high"
  }
}
```

**Response:**
```json
{
  "success": true,
  "tokenId": "1001",
  "transactionId": "0.0.12345@123456789.123456789",
  "organ": {
    "id": "1001",
    "status": "Available",
    "tokenURI": "ipfs://Qm...",
    "blockchainHash": "0x..."
  }
}
```

#### Get All Organs
```http
GET /api/organs
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1001",
      "organType": "Heart",
      "bloodType": "A+",
      "status": "Available",
      "hospital": "St. Mary's Hospital",
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 47
  }
}
```

#### Transfer Organ
```http
PUT /api/organs/:id/transfer
Content-Type: application/json

{
  "toHospital": "City General Hospital",
  "transportMethod": "Air Ambulance",
  "estimatedArrival": "2025-01-15T14:00:00Z",
  "notes": "Urgent transfer for recipient match"
}
```

#### Complete Transplant
```http
PUT /api/organs/:id/transplant
Content-Type: application/json

{
  "recipient": {
    "name": "Jane Smith",
    "age": 32,
    "hospital": "City General Hospital"
  },
  "surgeon": "Dr. Emily Chen",
  "outcome": "Successful",
  "notes": "Standard procedure, minimal complications"
}
```

### 🏢 Hospital Management

#### Register Hospital
```http
POST /api/hospitals
Content-Type: application/json

{
  "name": "Metropolitan Medical Center",
  "location": {
    "address": "123 Medical Plaza",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "coordinates": [-74.0060, 40.7128]
  },
  "contact": {
    "phone": "+1-212-555-0123",
    "email": "transplant@metro-med.org"
  },
  "capabilities": ["Heart", "Liver", "Kidney"],
  "level": "Level 1 Trauma Center"
}
```

#### Get Nearby Hospitals
```http
GET /api/hospitals/nearby?lat=40.7128&lng=-74.0060&radius=50
```

### 📊 Analytics & Reporting

#### System Statistics
```http
GET /api/analytics/overview
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrgans": 47,
    "availableOrgans": 23,
    "transplantedToday": 3,
    "hospitals": 12,
    "successRate": 0.94,
    "averageWaitTime": 45 // minutes
  }
}
```

#### Transplant Success Rates
```http
GET /api/analytics/success-rates?period=month
```

#### Audit Logs
```http
GET /api/audit/logs?organId=1001
```

## 🔐 Authentication & Security

### Authentication System

OrgFlow implements a dual authentication system supporting both API keys and JWT tokens for hospital access.

#### Login with API Key
```http
POST /auth/login
Content-Type: application/json

{
  "hospitalId": "HOSP001",
  "apiKey": "orgflow-dev-api-key"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "hospital": {
    "id": "HOSP001",
    "name": "Hospital HOSP001",
    "role": "hospital"
  }
}
```

#### Verify JWT Token
```http
GET /auth/verify
Authorization: Bearer <jwt-token>
```

#### Authentication Methods

**API Key Authentication:**
- Include `x-api-key: your-api-key` header
- Simple and direct for system-to-system communication

**JWT Token Authentication:**
- Include `Authorization: Bearer <token>` header
- Supports session management and expiration
- Tokens expire after 24 hours

### Protected Endpoints

The following endpoints require authentication:

- `POST /createOrgan` - Create new organ NFT
- `POST /transferOrgan` - Transfer organ to hospital
- `POST /transplantOrgan` - Record organ transplant
- `POST /createOrganRequest` - Create transfer request
- `PUT /updateOrganRequest` - Accept/reject transfer request

### Public Endpoints

These endpoints are accessible without authentication:

- `GET /organs` - View all organs
- `GET /analytics` - System analytics
- `GET /organRequests` - View transfer requests
- `GET /ledger` - Audit ledger
- `GET /health` - Health check
- `GET /debug` - Debug information

### API Security Features

- **Authentication Required:** Sensitive operations protected
- **Token Expiration:** JWT tokens expire after 24 hours
- **Input Validation:** Comprehensive request sanitization
- **CORS Protection:** Configurable cross-origin policies
- **Error Handling:** Structured error responses with appropriate HTTP codes

## 🔌 Real-Time WebSocket Notifications

OrgFlow includes real-time WebSocket notifications for instant updates across all connected hospitals and systems.

### WebSocket Connection

**Connection URL:** `ws://localhost:3002` (or your server URL)

**Authentication:**
```javascript
socket.emit('authenticate', {
  hospitalId: 'HOSP001',
  token: 'your-jwt-token'
});
```

### Available Events

#### System Events
- **`authenticated`** - Authentication successful
- **`authentication_failed`** - Authentication failed
- **`system_status`** - Current system statistics
- **`pong`** - Response to ping

#### Organ Events
- **`organ_created`** - New organ registered
- **`organ_transferred`** - Organ transferred between hospitals
- **`organ_arrived`** - Organ arrived at destination
- **`organ_transplanted`** - Organ successfully transplanted

#### Request Events
- **`request_updated`** - Transfer request accepted/rejected

### Event Data Structures

#### Organ Created
```json
{
  "organ": {
    "tokenId": 1001,
    "organType": "Heart",
    "bloodType": "A+",
    "status": "Donated",
    "hospital": "St. Mary's Hospital",
    "createdAt": "2025-01-15T10:30:00Z"
  },
  "hospital": "Hospital HOSP001",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

#### Organ Transferred
```json
{
  "organ": {
    "tokenId": 1001,
    "organType": "Heart",
    "bloodType": "A+",
    "status": "Transferred",
    "hospital": "City General Hospital"
  },
  "fromHospital": "St. Mary's Hospital",
  "toHospital": "City General Hospital",
  "action": "transferred",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

#### Organ Transplanted
```json
{
  "organ": {
    "tokenId": 1001,
    "organType": "Heart",
    "bloodType": "A+",
    "status": "Transplanted",
    "hospital": "City General Hospital"
  },
  "recipient": {
    "name": "Jane Smith",
    "age": 32,
    "bloodType": "A+"
  },
  "surgeon": "Dr. Emily Chen",
  "transplantDate": "2025-01-15T14:00:00Z",
  "hospital": "Hospital HOSP001",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

#### Request Updated
```json
{
  "request": {
    "requestId": "REQ-123456",
    "organId": 1001,
    "requestingHospital": "City General Hospital",
    "owningHospital": "St. Mary's Hospital",
    "status": "accepted",
    "updatedAt": "2025-01-15T10:30:00Z"
  },
  "action": "accepted",
  "hospital": "Hospital HOSP001",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Client Implementation Example

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3002');

// Authenticate
socket.emit('authenticate', {
  hospitalId: 'HOSP001',
  token: localStorage.getItem('authToken')
});

// Listen for events
socket.on('organ_created', (data) => {
  console.log('New organ available:', data.organ);
  updateOrganList(data.organ);
});

socket.on('organ_transferred', (data) => {
  console.log('Organ transferred:', data);
  updateOrganStatus(data.organ.tokenId, data.action);
});

socket.on('system_status', (data) => {
  updateDashboardStats(data);
});
```

### Connection Management

- **Auto-reconnection:** Built-in reconnection on connection loss
- **Room-based messaging:** Hospitals receive targeted notifications
- **Connection health:** Ping-pong mechanism for monitoring
- **Authentication required:** All sensitive events require valid JWT

### Audit Trail

All authenticated operations are logged with:
- Timestamp (ISO 8601)
- Hospital ID and name
- Operation type and details
- Blockchain transaction hash (when applicable)
- WebSocket connection tracking

## 🔧 Development Scripts

```bash
# Development
npm run dev          # Start with nodemon
npm run start        # Production start

# Database
npm run generate-keys    # Generate Hedera keys
npm run generate-mock    # Create sample organs
npm run generate-mock-data # Extended test data

# Deployment
npm run deploy       # Deploy smart contract
npm run test         # Run test suites

# Utilities
npm run seed         # Seed database
npm run migrate      # Database migrations
npm run backup       # Create data backup
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/     # Route handlers
│   ├── models/         # Data models
│   ├── services/       # Business logic
│   ├── middleware/     # Auth, validation, etc.
│   ├── utils/          # Helper functions
│   └── config/         # Configuration files
├── scripts/            # Deployment & utility scripts
├── contracts/          # Smart contract source
├── test/              # Test files
├── logs/              # Application logs
├── .env               # Environment variables
├── server.js          # Main application entry
├── package.json       # Dependencies
└── README.md          # Documentation
```

## 🧪 Testing

OrgFlow includes a comprehensive test suite covering all critical system functionality.

### Test Suite Overview

The test suite includes **7 major test categories**:

1. **🏥 Health Tests** - Server connectivity and basic functionality
2. **🔐 Authentication Tests** - API key and JWT token validation
3. **🫀 Organ Management Tests** - Complete organ lifecycle (create → transfer → transplant)
4. **🗄️ Database Tests** - Data persistence and ledger functionality
5. **🔌 WebSocket Tests** - Real-time notification system
6. **🚨 Error Handling Tests** - Input validation and error responses
7. **⚡ Performance Tests** - Response times and concurrent load

### Running Tests

```bash
# Run complete test suite
npm test

# Run with verbose output
npm run test:verbose

# Skip WebSocket tests (for CI/CD)
npm run test:skip-websocket

# Run individual test modules
npm run test:health          # Health checks only
npm run test:websocket       # WebSocket functionality
npm run test:hts            # HTS NFT operations
npm run test:server         # Basic server functionality
```

### Test Configuration

**Environment Variables:**
```bash
# Enable verbose logging
VERBOSE=true

# Skip WebSocket tests (useful for CI/CD)
SKIP_WEBSOCKET=true

# Custom server URL (for testing against different environments)
SERVER_URL=http://localhost:3002
```

### Test Results

The test suite provides detailed reporting:

```
🚀 Starting OrgFlow Comprehensive Test Suite

🏥 Running Health Tests
------------------------------
✅ PASSED: Server Health Check
✅ PASSED: Debug Endpoint Access
✅ PASSED: CORS Headers

📊 Test Suite Results
Total Tests: 25
Passed: 23
Failed: 2
Skipped: 0
Success Rate: 92.0%
Duration: 45.67s
```

### Test Coverage

**✅ Fully Tested Components:**
- HTS NFT minting with metadata optimization
- Authentication and authorization flows
- Complete organ lifecycle management
- Real-time WebSocket notifications
- Database operations (Supabase + JSON fallback)
- API endpoint validation
- Error handling and edge cases
- Performance and load testing

**🔧 Test Utilities:**
- Automated test data cleanup
- Parallel test execution
- Comprehensive error reporting
- CI/CD integration ready

## 📊 Monitoring

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00Z",
  "services": {
    "database": "connected",
    "hedera": "online",
    "blockchain": "synced"
  },
  "uptime": "2 days, 4 hours"
}
```

### Metrics Endpoint
```http
GET /metrics
```

## 🚀 Production Deployment

### Environment Checklist
- [ ] Hedera mainnet account configured
- [ ] Production MongoDB cluster
- [ ] SSL certificates configured
- [ ] Environment variables set
- [ ] Load balancer configured
- [ ] Monitoring tools set up
- [ ] Backup procedures tested

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3002
CMD ["npm", "start"]
```

## 🐛 Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid blood type provided",
    "details": {
      "field": "bloodType",
      "provided": "AB+",
      "allowed": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    },
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: Invalid credentials
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `BLOCKCHAIN_ERROR`: Hedera network issues
- `DATABASE_ERROR`: Data persistence issues

## 📞 Support & Troubleshooting

### Common Issues

**Hedera Connection Failed:**
```bash
# Check network configuration
curl https://testnet.mirrornode.hedera.com/api/v1/network/nodes

# Verify account balance
npx hedera-cli account-info 0.0.YOUR_ACCOUNT_ID
```

**MongoDB Connection Issues:**
```bash
# Check connection string
mongosh "mongodb://localhost:27017/orgflow"

# Verify user permissions
db.getUser("orgflow-user")
```

### Getting Help
- **GitHub Issues:** Bug reports and feature requests
- **Hedera Discord:** Blockchain integration questions
- **API Documentation:** `/api/docs` endpoint (if enabled)

## 🔗 Related Documentation

- **Frontend Integration:** `../organflow-hash-care-main/README.md`
- **Smart Contracts:** `contracts/OrganNFT.sol`
- **API Documentation:** `/api/docs` (Swagger UI)
- **Deployment Guide:** `docs/deployment.md`

---

**OrgFlow Backend API - Powering Life-Saving Medical Operations** 🩺
