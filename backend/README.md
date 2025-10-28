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

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Generate cryptographic keys:**
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

### Hospital Authentication
```http
POST /api/auth/login
Content-Type: application/json

{
  "hospitalId": "HOSP_001",
  "apiKey": "your-secure-api-key"
}
```

### API Security Features
- **Rate Limiting:** 1000 requests/hour per hospital
- **Input Validation:** Comprehensive sanitization
- **CORS:** Configurable cross-origin policies
- **Helmet.js:** Security headers
- **Error Handling:** Structured error responses

### Audit Trail
All organ operations are logged with:
- Timestamp
- Hospital ID
- User action
- Blockchain transaction hash
- IP address and user agent

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

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# API integration tests
npm run test:integration

# Load testing
npm run test:load
```

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
