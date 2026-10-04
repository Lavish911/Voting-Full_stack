# Decentralized E-Voting Platform

A professional, secure, and transparent decentralized application (dApp) for running elections on the Ethereum blockchain. Built for modern civic platforms requiring tamper-resistant voting with high visual fidelity and robust reliability.

## 1. Project Overview

This project provides a complete full-stack Ethereum application where an election administrator can deploy a set of candidates to the blockchain, and voters can cast secure, immutable votes. The frontend is designed to look like a modern election commission portal, prioritizing trust, security, and simplicity.

## 2. Features

- **Immutable Voting**: Votes are recorded permanently on the Ethereum blockchain.
- **One Vote Per Wallet**: The smart contract enforces that each Ethereum address can only cast a single vote.
- **Live Transparent Results**: Anyone can view the real-time vote count directly from the smart contract, ensuring zero manipulation.
- **Professional Civic UI**: A clean, accessible, and responsive user interface reflecting the seriousness of civic elections.
- **MetaMask Integration**: Seamless connection to Web3 wallets for secure transaction signing.

## 3. Architecture

- **Smart Contract**: Solidity-based contract (`Election.sol`) that stores candidates and voting records.
- **Frontend**: Vanilla HTML/CSS/JS interface that communicates directly with the Ethereum blockchain via Web3.js.
- **Blockchain Network**: Designed to be deployed on local testnets (Ganache) or public testnets (Sepolia).

## 4. Tech Stack

- **Solidity**: Smart contract development
- **Truffle**: Development environment, testing framework, and asset pipeline
- **Web3.js**: Ethereum JavaScript API (v0.20 API structure utilized)
- **Vanilla CSS/JS**: No heavy frontend frameworks, ensuring lightweight and fast execution
- **Lite-Server**: Lightweight development node server

## 5. Smart Contract Details

The `Election.sol` contract exposes the following functionality:
- `candidates`: Mapping of candidate ID to `Candidate` struct (id, name, voteCount).
- `voters`: Mapping of addresses to a boolean tracking if they have voted.
- `vote(uint _candidateId)`: The primary function for users to cast a vote. It requires the sender hasn't voted before and validates the candidate ID.

## 6. Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/)
- [Truffle](https://trufflesuite.com/truffle/) (`npm install -g truffle`)
- [Ganache](https://trufflesuite.com/ganache/)
- [MetaMask](https://metamask.io/) extension installed in your browser

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## 7. Ganache Setup

1. Open Ganache.
2. Create a new workspace or use quickstart.
3. Ensure the RPC Server is running on `http://127.0.0.1:7545`.
4. The local blockchain is now ready.

## 8. MetaMask Configuration

1. Open MetaMask and add a custom network.
2. Set RPC URL to `http://127.0.0.1:7545`.
3. Set Chain ID to `1337` (or `5777` depending on your Ganache version).
4. Import an account from Ganache into MetaMask using one of the provided private keys.

## 9. Contract Deployment

Deploy the smart contract to the local Ganache network:

```bash
truffle migrate --reset
```

## 10. Frontend Setup

Start the local development server:

```bash
npm run dev
```

The application will launch automatically in your browser at `http://localhost:3000`.

## 11. Sepolia Setup & Deployment

To deploy to Sepolia yourself:
1. Copy `.env.example` to `.env` and fill in your RPC URL and Private Key.
2. Run the deployment script to deploy safely to Sepolia:
   ```bash
   node deploy.js
   ```

## 12. Smart Contract (Sepolia)

- **Deployed Address:** `0xf338182B03EF95626a46235DC8C877b9151Ef85C`
- **Deployment Transaction:** `0xe9d38716bc05392a3572a906d526465d2a11c56655a8dabcc5e688d6e48a5654`

## 13. Live Demo (Frontend Deployment)

To deploy the frontend publicly:
1. Ensure Vercel CLI is installed.
2. Run `vercel` in the project root.
3. Your deployment will automatically pick up the live smart contract.

## 14. Known Limitations

- **Educational/Portfolio Project**: This dApp is designed for demonstration and lacks formal security audits for binding public elections.
- **Testnet Deployment**: Currently deployed on Ethereum Sepolia, not Mainnet.
- **Candidate Management**: The current version has pre-configured candidates in the constructor. Dynamic candidate addition after deployment is not included by design for immutable elections.
- **Web3 Version**: The frontend utilizes an older version of Truffle-contract and Web3.js compatibility, ensuring it runs reliably with the existing backend configuration.

---

*Built with Solidity · Ethereum · Web3.js*
