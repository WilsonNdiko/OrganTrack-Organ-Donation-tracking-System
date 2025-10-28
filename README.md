# OrganTrack: Organ Donation Tracking System

OrganTrack brings transparency and accountability to the organ donation and transplant process using Hedera Hashgraph technology. This system tracks organ NFTs from donation to transplantation, ensuring secure and traceable organ lifecycle management.

## 🏥 Features

- **Organ NFT Creation**: Mint NFTs representing donated organs with detailed metadata
- **Lifecycle Tracking**: Monitor organ status from donation → hospital → recipient
- **Secure Smart Contracts**: Built on Hedera Smart Contracts for immutable records
- **Real-time Dashboard**: Interactive frontend for tracking and visualizing organ data
- **Blockchain Transparency**: All transactions recorded on Hedera testnet

## 🏗️ Project Structure

```
├── backend/              # Node.js backend with Hedera integration
│   ├── contracts/        # Solidity smart contracts
│   ├── scripts/         # Deployment and utility scripts
│   └── server.js        # Express API server
├── organflow-hash-care-main/  # React frontend application
│   ├── src/             # Frontend source code
│   ├── public/          # Static assets
│   └── package.json     # Frontend dependencies
└── README.md           # This file
```

## 🚀 Setup & Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Hedera testnet account

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate Hedera keys:
   ```bash
   npm run generate-keys
   ```

4. Configure `.env` file with:
   - Hedera testnet account ID
   - Hedera private key (use ECDSA)
   - Contract address (after deployment)

5. Deploy smart contract:
   ```bash
   npm run deploy
   ```

6. Generate mock data (optional):
   ```bash
   npm run generate-mock
   ```

7. Start backend server:
   ```bash
   npm start
   ```
   Server runs on http://localhost:3001

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd organflow-hash-care-main
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```
   Frontend runs on http://localhost:5173

## 🔗 API Endpoints

- `POST /createOrgan` - Create new organ NFT
- `POST /transferOrgan` - Transfer organ to hospital
- `POST /transplantOrgan` - Transplant organ to recipient

## 🧠 Tech Stack

- **Backend**: Node.js, Express, Hedera SDK
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Blockchain**: Hedera Smart Contracts, Solidity
- **Database**: Hedera Consensus Service

## 📋 Roadmap

- [ ] Mainnet deployment
- [ ] Multi-hospital support
- [ ] Advanced analytics dashboard
- [ ] Mobile application
- [ ] Integration with EHR systems

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- Hedera Hashgraph: https://hedera.com/
- Documentation: [Coming Soon]
- Deployment: [Repository URL]

---

Built with ❤️ for transparent organ donation tracking.
