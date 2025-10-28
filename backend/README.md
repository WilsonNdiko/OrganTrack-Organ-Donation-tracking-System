# Backend for OrganFlow Hash Care

This backend provides API endpoints for organ NFT lifecycle management on Hedera testnet.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Generate Hedera keys:
   ```
   npm run generate-keys
   ```
   This will output ED25519 and ECDSA private keys.

3. Fill in `.env` with:
   - Your Hedera testnet account ID and private key (use ECDSA for smart contracts).
   - Contract address after deployment.

## Deploy Smart Contract

1. Compile the contract and get ABI and bytecode (e.g., using Remix or Hardhat).
2. Update `scripts/deploy.js` with the actual ABI and bytecode.
3. Run:
   ```
   npm run deploy
   ```
   This will deploy to Hedera testnet and update `.env` with contract address.

## Generate Mock Data

After deployment:
```
npm run generate-mock
```
This will mint 6 sample organ NFTs.

## Start Server

```
npm start
```
Server runs on port 3001.

## API Endpoints

- `POST /createOrgan`: Create new organ NFT
  Body: { donor: string, organType: string, bloodType: string, tokenURI: string }

- `POST /transferOrgan`: Transfer organ to hospital
  Body: { tokenId: number, hospital: string }

- `POST /transplantOrgan`: Transplant organ to recipient
  Body: { tokenId: number, recipient: string }

## Frontend Connection

The frontend API service is in `../src/services/api.ts`.

Ensure backend is running when using frontend.
