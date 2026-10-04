# DecentraVote — Blockchain-Based E-Voting dApp

A portfolio-focused Ethereum voting dApp that demonstrates **wallet-based voter identity, on-chain vote recording, election lifecycle controls, and one-vote-per-wallet enforcement**.

**Live demo:** https://evotingdapp-mu.vercel.app  
**Network:** Ethereum Sepolia (Chain ID: 11155111)  
**Deployed contract:** `0xAce9bDE7a05308f1bECe3D5fA804D695dBa95314`

> **Scope:** This is an educational/portfolio blockchain voting demonstration. It is **not** intended for binding public elections and has not undergone a formal security audit.

## What it demonstrates

- **On-chain voting** — votes are recorded through Solidity transactions on Ethereum Sepolia.
- **Wallet-based identity** — MetaMask provides the connected Ethereum address used by the contract.
- **One-vote-per-wallet enforcement** — the contract rejects a second vote from the same address.
- **Election lifecycle** — `NOT_STARTED → ACTIVE → CLOSED`.
- **Owner/Admin controls** — the contract owner can start/end the election and add candidates before voting starts.
- **Live results** — candidate vote counts are read from the deployed contract.
- **Demo Mode** — a wallet-free local simulation is available for exploring the UI without creating blockchain transactions.
- **Responsive civic-style UI** — lightweight Vanilla HTML/CSS/JavaScript frontend.

## Modes

### Demo Mode

Demo Mode uses browser `localStorage` and simulated state.

- No MetaMask required.
- No real blockchain transactions.
- Includes simulated voter/admin workflows.
- Clearly separated from Live Blockchain Mode.

### Live Blockchain Mode

Live Mode connects the browser to MetaMask and the deployed Sepolia contract.

- **Network:** Ethereum Sepolia
- **Chain ID:** `11155111`
- **Wallet:** MetaMask
- **Admin:** contract owner
- **Voter:** any other connected wallet
- **Transactions:** real Sepolia testnet transactions

Sepolia ETH has no real-world monetary value.

## Architecture

```
MetaMask
   │
   ▼
Vanilla HTML / CSS / JavaScript
   │
   │ Web3.js + Truffle Contract
   ▼
Ethereum Sepolia
   │
   ▼
Election.sol
   ├── owner / admin access control
   ├── electionState
   ├── candidates
   ├── voters[address]
   └── vote counts + events
```

The frontend reads the contract ABI/address from `build/contracts/Election.json` and interacts with the deployed contract through MetaMask.

## Smart Contract

`contracts/Election.sol` implements:

### Election states

- `NOT_STARTED` — candidates can be added by the owner.
- `ACTIVE` — eligible connected wallets can vote.
- `CLOSED` — voting is disabled.

### Admin operations

- `addCandidate(string)`
- `startElection()`
- `endElection()`

These operations are protected by the `onlyOwner` modifier.

### Voting

`vote(uint256 candidateId)` checks:

1. The election is active.
2. The wallet has not already voted.
3. The candidate ID is valid.

It then records the wallet as having voted and increments the candidate's vote count.

### Events

- `CandidateAdded`
- `ElectionStarted`
- `ElectionEnded`
- `VoteCast`

## Sepolia Deployment

**Contract address:**  
`0xAce9bDE7a05308f1bECe3D5fA804D695dBa95314`

**Deployment transaction:**  
`0x089454466e6bdffd38dc6822bbb412f06b38c26462f218917b983fe867ab4000`

**Sepolia Etherscan:**  
https://sepolia.etherscan.io/address/0xAce9bDE7a05308f1bECe3D5fA804D695dBa95314

## Local Development

### Prerequisites

- Node.js
- npm
- Truffle
- Ganache (for local blockchain development)
- MetaMask (for wallet interaction)

### Install

```bash
npm install
```

### Run the frontend

```bash
npm run dev
```

The Lite Server configuration serves the application locally.

### Run contract tests

```bash
npm test
```

The test suite covers deployment, owner access control, election lifecycle transitions, candidate restrictions, successful voting, duplicate-vote rejection, invalid candidate rejection, emitted events, and voting after the election closes.

> **Environment note:** Truffle/Ganache tooling can emit native `uws` compatibility warnings on newer Node.js releases. If the local test environment reports a Ganache runtime compatibility issue, use a Node.js version supported by the installed Truffle/Ganache dependency set.

## Deploying to Sepolia

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Set:
   ```text
   SEPOLIA_RPC_URL=<your Sepolia RPC endpoint>
   DEPLOYER_PRIVATE_KEY=<your deployment wallet private key>
   ```
3. Deploy:
   ```bash
   node deploy.js
   ```

**Never commit `.env` or a real private key.** The repository's `.gitignore` excludes `.env`.

> The frontend does not use the deployer's private key. It uses MetaMask to sign user transactions.

## Project Structure

```
Voting-Full_stack/
├── contracts/
│   └── Election.sol
├── migrations/
│   └── 2_deploy_contracts.js
├── build/contracts/
│   └── Election.json
├── src/
│   ├── index.html
│   ├── css/
│   └── js/
├── test/
│   └── election.js
├── deploy.js
├── truffle-config.js
├── package.json
└── .env.example
```

## Security & Scope Notes

This project demonstrates smart-contract access control and vote-integrity rules, but it should **not** be presented as a production election system.

Important limitations:

- Wallet addresses are pseudonymous identities, not verified real-world voter identities.
- The project does not provide ballot secrecy/anonymity.
- Ethereum Sepolia is a public testnet.
- There is no formal smart-contract security audit.
- The contract uses a single owner account for administrative control.
- The system is intended for learning, portfolio demonstration, and technical evaluation.

## Technology Stack

- **Solidity**
- **Ethereum / Sepolia**
- **Web3.js**
- **Truffle**
- **MetaMask**
- **Vanilla HTML/CSS/JavaScript**
- **Lite Server**

## Author

**Lavish Rahangdale**

GitHub: https://github.com/Lavish911
