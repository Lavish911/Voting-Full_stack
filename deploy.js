require('dotenv').config();
const { Web3 } = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');
const path = require('path');

async function deploy() {
    try {
        console.log("Initializing provider...");
        const provider = new HDWalletProvider(
            process.env.DEPLOYER_PRIVATE_KEY,
            process.env.SEPOLIA_RPC_URL
        );
        const web3 = new Web3(provider);

        console.log("Reading contract artifact...");
        const artifactPath = path.join(__dirname, 'build', 'contracts', 'Election.json');
        const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

        const accounts = await web3.eth.getAccounts();
        console.log(`Deploying from account: ${accounts[0]}`);

        const contract = new web3.eth.Contract(artifact.abi);
        
        console.log("Sending deployment transaction...");
        const instance = await contract.deploy({ data: artifact.bytecode })
            .send({ from: accounts[0], gas: 4000000 })
            .on('transactionHash', function(hash){
                console.log("Transaction Hash:", hash);
                artifact.networks["11155111"] = {
                    "events": {},
                    "links": {},
                    "transactionHash": hash
                };
            });

        console.log("Contract successfully deployed at:", instance.options.address);

        // Update artifact
        artifact.networks["11155111"].address = instance.options.address;
        fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));
        console.log("Updated Election.json with Sepolia address!");

        provider.engine.stop();
        process.exit(0);
    } catch (e) {
        console.error("Deploy failed:", e);
        process.exit(1);
    }
}

deploy();
