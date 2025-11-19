# OrgFlow Testing Suite

Comprehensive testing suite for the OrgFlow organ donation tracking system.

## Overview

The testing suite covers all major functionality including:
- ✅ HTS NFT minting with Hedera
- ✅ WebSocket real-time notifications
- ✅ Supabase database operations
- ✅ Authentication and authorization
- ✅ Organ lifecycle management
- ✅ Request management system
- ✅ Ledger functionality

## Quick Start

### Prerequisites

1. **Environment Setup**: Copy `.env` file with required variables:
   ```bash
   BASE_URL=http://localhost:3002
   API_KEY=orgflow-dev-api-key
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_key
   TOKEN_ID=0.0.7190924  # For HTS testing
   HEDERA_ACCOUNT_ID=your_account_id
   HEDERA_PRIVATE_KEY=your_private_key
   ```

2. **Start the backend server**:
   ```bash
   npm run dev
   ```

### Running Tests

#### Full Test Suite
```bash
npm test
```

#### Individual Test Categories
```bash
# Health check only
npm run test:health

# WebSocket tests only
npm run test:websocket

# HTS NFT tests only
npm run test:hts

# Server functionality tests
npm run test:server
```

#### Advanced Options
```bash
# Verbose output
npm run test:verbose

# Skip WebSocket tests (for CI/CD)
npm run test:skip-websocket
```

## Test Categories

### 1. Health & Connectivity Tests
- **Health Check**: Verifies API availability and version
- **Authentication**: Tests login and token verification
- **WebSocket Connection**: Validates real-time connectivity

### 2. Core Functionality Tests
- **Organ Creation**: Tests HTS NFT minting with metadata optimization
- **Organ Retrieval**: Validates data fetching from Supabase/local storage
- **Organ Requests**: Tests the request management workflow
- **Organ Transfers**: Validates status updates and notifications

### 3. Infrastructure Tests
- **Supabase Operations**: Database connectivity and CRUD operations
- **Ledger System**: Event recording and retrieval
- **Analytics**: System metrics and reporting

### 4. Advanced Tests
- **HTS Validation**: Hedera token format and connectivity
- **Real-time Notifications**: WebSocket broadcasting
- **Error Handling**: Graceful failure scenarios

## Test Results

The test suite provides detailed output including:

```
🚀 Starting OrgFlow Comprehensive Testing Suite
============================================================
[2025-11-04T14:35:02.000Z] ✅ Health check request should not error
[2025-11-04T14:35:02.100Z] ✅ Health check should return 200
[2025-11-04T14:35:02.150Z] ✅ Health check should return ok status
============================================================
📊 Test Results Summary
Total Tests: 25
✅ Passed: 23
❌ Failed: 2
⏱️  Duration: 45.67 seconds
📈 Success Rate: 92.0%
```

## Configuration Options

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `BASE_URL` | Backend API URL | No (defaults to localhost:3002) |
| `API_KEY` | Authentication key | No (uses default) |
| `SUPABASE_URL` | Supabase project URL | Yes (for DB tests) |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes (for DB tests) |
| `TOKEN_ID` | Hedera HTS token ID | No (for HTS tests) |
| `HEDERA_ACCOUNT_ID` | Hedera account ID | No (for HTS tests) |
| `HEDERA_PRIVATE_KEY` | Hedera private key | No (for HTS tests) |

### Test Flags

| Flag | Description |
|------|-------------|
| `VERBOSE=true` | Enable detailed logging |
| `SKIP_WEBSOCKET=true` | Skip WebSocket tests |

## Test Architecture

### Test Structure
```
test-suite.js
├── Utility Functions
│   ├── log() - Timestamped logging
│   ├── assert() - Test assertion helper
│   └── makeRequest() - HTTP request helper
├── Test Functions
│   ├── testHealthCheck()
│   ├── testAuthentication()
│   ├── testOrganCreation()
│   ├── testWebSocketConnection()
│   └── ... (15+ test functions)
└── Main Runner
    └── runTests() - Orchestrates all tests
```

### Test Flow
1. **Setup**: Initialize clients and configuration
2. **Connectivity**: Test basic API availability
3. **Authentication**: Verify security mechanisms
4. **Core Features**: Test main business logic
5. **Infrastructure**: Validate supporting systems
6. **Advanced**: Test complex integrations
7. **Cleanup**: Generate reports and exit

## Troubleshooting

### Common Issues

#### WebSocket Tests Failing
```bash
# Check if server is running
curl http://localhost:3002/health

# Verify WebSocket port
netstat -an | grep 3002
```

#### HTS Tests Failing
```bash
# Verify Hedera credentials
echo $TOKEN_ID
echo $HEDERA_ACCOUNT_ID

# Check Hedera network status
curl https://testnet.mirrornode.hedera.com/api/v1/network/nodes
```

#### Supabase Tests Failing
```bash
# Verify Supabase connection
curl $SUPABASE_URL/rest/v1/

# Check API key
echo $SUPABASE_ANON_KEY | head -c 20
```

### Debug Mode

Enable verbose logging for detailed troubleshooting:
```bash
VERBOSE=true npm test
```

## Integration with CI/CD

### GitHub Actions Example
```yaml
- name: Run Tests
  run: |
    cd backend
    npm install
    npm run test:verbose
  env:
    BASE_URL: http://localhost:3002
    API_KEY: ${{ secrets.API_KEY }}
    SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

### Docker Testing
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm test
```

## Contributing

When adding new tests:

1. **Follow naming convention**: `test[FeatureName]()`
2. **Use assert()** for test validation
3. **Add proper error handling**
4. **Include cleanup** for created resources
5. **Update documentation**

### Example Test Addition
```javascript
async function testNewFeature() {
  log('Testing new feature...');

  const result = await makeRequest('/new-endpoint');
  assert(result.response?.status === 200, 'New endpoint should work');
  assert(result.data?.feature === 'enabled', 'Feature should be enabled');
}
```

## Performance Benchmarks

Typical test execution times:
- **Full Suite**: 30-60 seconds
- **Health Check**: < 1 second
- **WebSocket Tests**: 5-10 seconds
- **HTS Minting**: 10-20 seconds (network dependent)

## Security Testing

The suite includes security validation:
- ✅ API key authentication
- ✅ JWT token verification
- ✅ CORS configuration
- ✅ Input validation
- ✅ Error message sanitization

## Future Enhancements

Planned test improvements:
- 🔄 **Load Testing**: Concurrent user simulation
- 📊 **Performance Metrics**: Response time tracking
- 🔍 **Integration Tests**: Full workflow validation
- 📱 **Frontend Tests**: E2E user journey testing
- ☁️ **Cloud Deployment Tests**: Multi-environment validation
