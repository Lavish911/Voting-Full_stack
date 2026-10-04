require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');
const { URL } = require('url');

async function test() {
  console.log("=== Safe Diagnostics ===");
  
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  console.log("SEPOLIA_RPC_URL exists:", !!rpcUrl);
  if (rpcUrl) {
    try {
      const parsedUrl = new URL(rpcUrl);
      console.log("Hostname:", parsedUrl.hostname);
    } catch (e) {
      console.log("Hostname: Invalid URL format");
    }
  }

  const pk = process.env.DEPLOYER_PRIVATE_KEY;
  console.log("DEPLOYER_PRIVATE_KEY exists:", !!pk);
  if (pk) {
    console.log("Private Key length:", pk.length);
    console.log("Starts with 0x:", pk.startsWith("0x"));
  }
  
  try {
    const pkg = require('./package.json');
    console.log("HDWalletProvider version:", pkg.dependencies['@truffle/hdwallet-provider']);
  } catch (e) {}

  console.log("========================");

  if (!rpcUrl || !pk) {
    console.error("Missing credentials in .env");
    process.exit(1);
  }

  // HDWalletProvider expects PKs without 0x or will handle it? It usually expects without 0x, or accepts 0x.
  // Actually, truffle docs say "without 0x" or array of private keys. Let's just pass it as is.
  let provider;
  try {
    provider = new HDWalletProvider(pk, rpcUrl);
    console.log("Provider instantiated successfully.");
  } catch (e) {
    console.error("Error instantiating provider:", e.message);
    process.exit(1);
  }

  console.log("Testing RPC connection (eth_chainId)...");
  
  provider.send({
    jsonrpc: '2.0',
    method: 'eth_chainId',
    params: [],
    id: 1
  }, (err, res) => {
    if (err) {
      console.error("RPC Error:", err);
      process.exit(1);
    }
    console.log("RPC Response:", res);
    
    // Test eth_blockNumber
    provider.send({
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
      id: 2
    }, (err2, res2) => {
      if (err2) {
        console.error("RPC Error 2:", err2);
      } else {
        console.log("RPC Block Number:", res2);
      }
      
      // Stop the provider to allow script to exit
      provider.engine.stop();
    });
  });
}

test();
