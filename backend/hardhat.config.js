
// For Hedera testnet deployment
export default {
  solidity: "0.8.19",
  networks: {
    hedera: {
      url: process.env.HEDERA_TESTNET_RPC_URL,
      accounts: [process.env.HEDERA_PRIVATE_KEY],
    },
  },
};
