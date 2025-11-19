# API Reference Guide

## 🖧 OrgFlow Backend API

Complete technical documentation for OrgFlow's RESTful API endpoints.

---

## 🎯 Base URL
```
Production: https://orgflow-backend-t55x.onrender.com
Development: http://localhost:3002
```

---

## 🔐 Authentication

### **API Key Authentication**
Include in headers: `x-api-key: your-api-key`

### **JWT Token Authentication**
Include in headers: `Authorization: Bearer <jwt-token>`

### **Login Endpoint:**
```http
POST /auth/login
Content-Type: application/json

{
  "hospitalId": "HOSP001",
  "apiKey": "orgflow-dev-api-key"
}

# Response:
{
  "success": true,
  "token": "jwt-token-here",
  "hospital": {
    "id": "HOSP001",
    "name": "Hospital HOSP001",
    "role": "hospital"
  }
}
```

---

## 🫀 Organ Management API

### **GET /organs** - Get all organs
**Authentication:** Optional (public read access)

```bash
curl -X GET "https://orgflow-backend-t55x.onrender.com/organs" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "tokenId": 1001,
      "organType": "Heart",
      "bloodType": "A+",
      "status": "Donated",
      "donor": "0x742d35Cc6644C0532925a3b374781F3485c6d5b8a",
      "hospital": "St. Mary's Hospital",
      "createdAt": "2025-01-15T10:30:00Z",
      "recipient": null
    }
  ]
}
```

### **POST /createOrgan** - Register new organ
**Authentication:** Required (Hospital API key/JWT)

```bash
curl -X POST "https://orgflow-backend-t55x.onrender.com/createOrgan" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "donor": "0x742d35Cc6644C0532925a3b374781F3485c6d5b8a",
    "organType": "Kidney",
    "bloodType": "O+",
    "hospital": "General Hospital",
    "recipientName": "John Doe",
    "tokenURI": "https://metadata.example.com/organ/1001"
  }'
```

**Response:**
```json
{
  "success": true,
  "tokenId": 1002,
  "txHash": "0.0.12345@123456789.123456789",
  "fullTokenId": "0.0.7190924#77",
  "message": "Real Hedera HTS NFT minted successfully!"
}
```

### **PUT /transferOrgan** - Transfer organ to hospital
**Authentication:** Required

```bash
curl -X PUT "https://orgflow-backend-t55x.onrender.com/transferOrgan" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "tokenId": 1002,
    "hospital": "City Medical Center"
  }'
```

### **PUT /transplantOrgan** - Complete transplant
**Authentication:** Required

```bash
curl -X PUT "https://orgflow-backend-t55x.onrender.com/transplantOrgan" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "tokenId": 1002,
    "recipient": "0x1234...",
    "recipientName": "Jane Smith",
    "recipientAge": 45,
    "recipientBloodType": "O+",
    "recipientHospital": "City Medical Center",
    "surgeon": "Dr. Sarah Johnson",
    "receiptNumber": "TX-2025-001",
    "transplantDate": "2025-01-15T14:30:00Z"
  }'
```

---

## 📨 Organ Request System

### **POST /createOrganRequest** - Request organ transfer
**Authentication:** Required

```bash
curl -X POST "https://orgflow-backend-t55x.onrender.com/createOrganRequest" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "organId": 1003,
    "requestingHospital": "City Medical Center",
    "owningHospital": "St. Mary's Hospital",
    "requesterAddress": "0x9876..."
  }'
```

### **GET /organRequests** - Get all requests
**Authentication:** Optional

```bash
curl -X GET "https://orgflow-backend-t55x.onrender.com/organRequests" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "REQ-1736956800000-123",
      "requestId": "REQ-1736956800000-123",
      "organId": 1003,
      "requestingHospital": "City Medical Center",
      "owningHospital": "St. Mary's Hospital",
      "status": "pending",
      "requesterAddress": "0x9876...",
      "createdAt": "2025-01-15T10:00:00Z",
      "nftTokenId": "0.0.7190924#78"
    }
  ]
}
```

### **PUT /updateOrganRequest** - Accept/Reject request
**Authentication:** Required

```bash
curl -X PUT "https://orgflow-backend-t55x.onrender.com/updateOrganRequest" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "requestId": "REQ-1736956800000-123",
    "status": "accepted",
    "organId": 1003
  }'
```

---

## 📊 Analytics & Monitoring

### **GET /analytics** - System metrics
**Authentication:** Optional

```bash
curl -X GET "https://orgflow-backend-t55x.onrender.com/analytics" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrgans": 47,
    "transplanted": 23,
    "inTransit": 5,
    "available": 19,
    "successRate": 0.94,
    "timestamp": "2025-01-15T15:30:00Z"
  }
}
```

### **GET /ledger** - Transaction audit trail
**Authentication:** Optional

```bash
curl -X GET "https://orgflow-backend-t55x.onrender.com/ledger" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "LEDGER-1736956800000-xyz",
      "type": "OrganTransplanted",
      "organId": 1001,
      "organType": "Heart",
      "bloodType": "A+",
      "hospital": "City Medical Center",
      "recipient": "Jane Smith",
      "surgeon": "Dr. Johnson",
      "txHash": "0.0.12345@123456789.123456789",
      "nftTokenId": "0.0.7190924#76",
      "timestamp": "2025-01-15T14:30:00Z",
      "details": "Organ Heart (A+) transplanted to Jane Smith at City Medical Center by Dr. Johnson"
    }
  ]
}
```

---

## 🔧 System Management

### **GET /health** - Health check
**Authentication:** None required

```bash
curl -X GET "https://orgflow-backend-t55x.onrender.com/health" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "status": "ok",
  "message": "OrgFlow API is running",
  "environment": "production",
  "version": "1.0.0",
  "timestamp": "2025-01-15T15:30:00Z",
  "uptime": "2 days",
  "services": {
    "database": "connected",
    "hedera": "online",
    "blockchain": "synced"
  }
}
```

### **GET /debug** - Debug information
**Authentication:** Optional

```bash
curl -X GET "https://orgflow-backend-t55x.onrender.com/debug" \
  -H "Content-Type: application/json"
```

### **DELETE /clearOrgans** - Reset system (development only)
**Authentication:** Admin required

---

## 🌐 Real-Time WebSocket API

### **Connection:**
```javascript
const socket = io('https://orgflow-backend-t55x.onrender.com');

// Authentication
socket.emit('authenticate', {
  hospitalId: 'HOSP001',
  token: 'jwt-token'
});

// Listen for events
socket.on('organ_created', (data) => {
  console.log('New organ:', data.organ);
});

socket.on('organ_transferred', (data) => {
  console.log('Organ transferred:', data);
});

socket.on('organ_transplanted', (data) => {
  console.log('Transplant completed:', data);
});

socket.on('request_created', (data) => {
  console.log('New request:', data.request);
});
```

### **Available Events:**
- **`authenticated`** - Authentication successful
- **`authentication_failed`** - Invalid credentials
- **`system_status`** - System statistics update
- **`organ_created`** - New organ registered
- **`organ_transferred`** - Organ transferred between hospitals
- **`organ_arrived`** - Organ arrived at destination
- **`organ_transplanted`** - Transplant completed
- **`request_created`** - New transfer request
- **`request_updated`** - Request accepted/rejected

---

## 📋 Error Handling

### **Standard Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid blood type provided",
    "details": {
      "field": "bloodType",
      "provided": "INVALID",
      "allowed": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    }
  }
}
```

### **HTTP Status Codes:**
- **200 OK** - Success
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Permission denied
- **404 Not Found** - Resource doesn't exist
- **500 Internal Server Error** - Server error

### **Common Error Codes:**
- `VALIDATION_ERROR` - Input validation failed
- `AUTHENTICATION_ERROR` - Invalid credentials
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `BLOCKCHAIN_ERROR` - Hedera network issues
- `DATABASE_ERROR` - Database operation failed

---

## 🔧 SDK & Integration

### **JavaScript SDK:**
```javascript
import { OrgFlowAPI } from 'orgflow-sdk';

const api = new OrgFlowAPI({
  baseURL: 'https://orgflow-backend-t55x.onrender.com',
  apiKey: 'your-key'
});

// Register organ
const organ = await api.createOrgan({
  organType: 'Kidney',
  bloodType: 'O+',
  hospital: 'General Hospital'
});
```

### **Rate Limiting:**
- **Authenticated requests:** 1000/hour per API key
- **Public requests:** 100/minute per IP
- **WebSocket connections:** 50 concurrent per hospital

### **Request Timeouts:**
- **Regular endpoints:** 30 seconds
- **Blockchain operations:** 120 seconds
- **WebSocket messages:** 10 seconds

---

## 🎯 Best Practices

### **API Usage:**
1. **Use HTTPS** for all production requests
2. **Handle rate limits** with exponential backoff
3. **Validate responses** before processing
4. **Monitor network status** during transfers
5. **Keep tokens secure** - never expose in client-side code

### **WebSocket Usage:**
1. **Authenticate immediately** after connection
2. **Handle reconnection** gracefully
3. **Subscribe to relevant events** only
4. **Monitor connection health** with ping/pong

### **Error Handling:**
1. **Retry failed requests** with jitter
2. **Log all errors** for debugging
3. **Notify users** of service disruptions
4. **Have fallback procedures** for outages

---

## 📞 Support

**Technical Issues:**
- 📧 api-support@orgflow.org
- 📖 [API Troubleshooting Guide](troubleshooting/api-errors)

**Integration Help:**
- 📧 integrations@orgflow.org
- 📚 [SDK Documentation](https://github.com/WilsonNdiko/OrganTrack)

---

*API Version: 1.0.0 | Last Updated: January 2025* 🔗

---

## 📋 Quick Reference

| Method | Endpoint | Action |
|--------|----------|--------|
| `GET` | `/organs` | List all organs |
| `POST` | `/createOrgan` | Register new organ |
| `PUT` | `/transferOrgan` | Transfer organ |
| `PUT` | `/transplantOrgan` | Complete transplant |
| `POST` | `/createOrganRequest` | Request transfer |
| `PUT` | `/updateOrganRequest` | Update request status |
| `GET` | `/analytics` | Get metrics |
| `GET` | `/ledger` | Audit trail |
| `GET` | `/health` | System health |

*This API powers life-saving organ donation operations worldwide.* 🩺
