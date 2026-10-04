require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    develop: {
      port: 8545
    },
    sepolia: {
      provider: () => new HDWalletProvider(
        process.env.DEPLOYER_PRIVATE_KEY,
        process.env.SEPOLIA_RPC_URL
      ),
      network_id: 11155111,
      gas: 4000000,
      confirmations: 2,
      timeoutBlocks: 200,
      networkCheckTimeout: 1000000,
      skipDryRun: true
    }
  },
  compilers: {
    solc: {
      version: "^0.5.16"
    }
  }
};
