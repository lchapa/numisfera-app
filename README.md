<p align="center">
  <img src="scifi_babylon_trade_simplified_1776038231715.png" alt="Numisfera Logo" width="300" />
</p>

# 🏛 Numisfera
**Bridging Traditional Numismatic Heritage with the Web3 Economy.**

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://java.com)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-Smart%20Contracts-363636.svg)](https://docs.soliditylang.org/)
[![GCP](https://img.shields.io/badge/Google%20Cloud-Platform-4285F4.svg)](https://cloud.google.com/)

Welcome to the official repository of **Numisfera**, a FinTech platform that revolutionizes numismatic collecting through digital certification and decentralized auctions powered by Blockchain technology.

---

## 🌎 Business Overview

Historically, the collecting and trading of high-value pieces (such as Centenarios, commemorative coins, and historical artifacts) has faced significant challenges: **provenance tracking, lack of international liquidity, and a deficit of trust between parties.**

**Numisfera** solves these issues by merging Web2 and Web3 technologies:
1. **Digitalization & Certification (Tokenization):** Real physical pieces are "minted" on Ethereum as an **NFT (ERC-721)**, providing absolute proof of ownership, provenance, and unalterable history for each asset.
2. **Decentralized & Transparent Auctions:** Powered by Smart Contracts, the entire bidding flow and fund retention are governed by open code. Numisfera never holds user funds; rather, it acts as a cryptographic escrow that guarantees atomic swaps (if you win an auction, the funds are routed to the seller, and the rights to the piece are automatically transferred to you).
3. **Trustless Economy:** The risk of scams is eliminated by conditioning financial and patrimonial transfers completely to an inalterable, on-chain execution.

### 🌟 Value Proposition for Collectors & Investors
- **Global Exposure:** Showcase and auction your pieces to an international audience bidding with standard cryptocurrencies (ETH).
- **Ultimate Control:** Seamless authentication using secure wallets like MetaMask. Your assets remain entirely yours until a valid, cryptographic transaction is finalized.

---

## 🛠 Tech Stack & Architecture

Numisfera goes beyond being a simple MVP; it is a highly mature, multi-tier ecosystem architected for high availability, observability, and absolute resilience.

### Blockchain (Immutable Settlement Layer)
- Developed in **Solidity** (using **Hardhat** Framework).
- **NumisferaNFT:** ERC-721 Smart Contract used to certify unique pieces.
- **NumisferaAuction:** Autonomous economic engine governed by strict rules (expiration dates mapped to `block.timestamp`, automatic refunds for outbid participants, exact settlement distribution).

### Backend (The Brain)
A robust master service responsible for chain indexing, metadata storage, and API security.
- **Java 17 & Spring Boot 3.2**
- **Hybrid Authentication (JWT + Web3):** A proprietary engine that challenges users to sign an ephemeral message (passwordless), utilizing `Web3j` (`EcRecover`) to mathematically verify wallet ownership, and subsequently issuing a secure _JWT_ to accelerate subsequent requests.
- **Data Persistence:** **MySQL 8** (remotely managed).
- **Synchronization:** Cron-jobs and transaction event handlers ensure the highly responsive local catalog accurately mirrors the state of Smart Contracts on the blockchain.

### Infrastructure (DevOps & Cloud Native - GCP)
Fully orchestrated within the **Google Cloud Platform (GCP)** ecosystem:
- **Cloud Run (Serverless):** Auto-scaling container deployments via **GitHub Actions** (CI/CD) pipelines.
- **Google Cloud Storage:** Ultra-high-resolution numismatic image hosting.
- **Cloud SQL:** Agile transactional database logic.
- **GCP Observability & Logging:** Advanced implementation of **Structured JSON Logback**. Integration of **MDC (Mapped Diagnostic Context)** traces `walletAddress` through all service logs, allowing targeted audits of core enterprise events (`[AUCTION_CREATED]`, `[BID_PLACED]`, etc.) in real-time within the GCP Logs Explorer.

### Frontend (User Experience)
- **React (Vite):** Frictionless, pure UI application.
- Deep integration covering asynchronous on-chain states utilizing **Ethers.js v6**. 
- Immersive visual design (Dark Theme / Glassmorphism) with responsive Vanilla CSS and fully incorporated i18n support.

---

## ⚙️ Architecture Deep Dive

> For a deep dive into our cloud architecture, integrations, and Web3 ↔️ Web2 synchronous flows, check the Functional Diagram:
> [👉 View architecture_diagram.md](architecture_diagram.md)

---

## 🚀 Local Setup & Development

### 1. Bootstrapping Smart Contracts
```bash
cd blockchain
npm install
npx hardhat node
```
*In a secondary terminal window, deploy the contracts to your local chain:*
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### 2. Starting the Backend (Java)
Ensure you have configured your environment variables (DB credentials, Storage keys) in `application.properties`.
```bash
cd backend
./mvnw spring-boot:run
```

### 3. Starting the Frontend
```bash
cd frontend
npm install
npm run dev
```
*Ensure MetaMask is connected to your local development network targeting `http://localhost:8545`.*

---
_Built with technical innovation and enterprise vision. If you are a recruiter exploring this codebase, you'll find clean asynchronous hybrid interfaces, hardened backend security, and battle-tested architectural patterns. If you are a user or collector, you've arrived at the gold standard._
