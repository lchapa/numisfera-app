# Numisfera Architecture Diagram

This diagram details the core components of the Numisfera platform: the React Frontend, the Java Spring Boot Backend, and the Ethereum Blockchain Contracts, along with their primary interactions.

```mermaid
graph TD;
    %% External Entities
    User((User/Collector))
    Web3Wallet[[Web3 Wallet <br/>e.g., MetaMask]]

    %% Frontend Components
    subgraph Frontend [React SPA / PWA]
        UI[User Interface <br/>Tailwind CSS / Components]
        APIClient[REST API Client <br/>Axios]
        Web3Provider[Web3 Provider <br/>Ethers.js]
    end

    %% Backend Components
    subgraph Backend [Java Spring Boot REST API]
        Controller[Controllers <br/>REST Endpoints]
        Service[Service Layer <br/>Business Logic]
        Repo[Repository Layer <br/>JPA / Hibernate]
        DB[(MySQL Database <br/>Coin Metadata, Profiles, Off-chain State)]
    end

    %% Blockchain Components
    subgraph Blockchain [Ethereum/EVM Network]
        NFTContract{NumisferaNFT.sol <br/>ERC-721 Smart Contract}
        AuctionContract{NumisferaAuction.sol <br/>Auction Smart Contract}
    end

    %% Interactions
    User -->|Interacts| UI
    UI -->|Triggers Signature/Tx| Web3Wallet
    Web3Wallet -.->|Approves| Web3Provider

    %% Frontend to Backend
    UI -->|Reads Catalog & Status| APIClient
    APIClient <-->|JSON over HTTPS| Controller
    Controller <--> Service
    Service <--> Repo
    Repo <--> DB

    %% Frontend to Blockchain
    Web3Provider -->|Mints NFT, Bids, Settles| NFTContract & AuctionContract

    %% Backend to Blockchain (Optional Sync) / Notes
    Service -.->|Verifies blockchain state <br/> e.g., token ownership| Blockchain
```

## Key Interactions Explained:
1. **Catalog Browsing**: The User interacts with the **Frontend**, which requests coin metadata from the **Backend MySQL Database** via the REST API.
2. **Authentication & Identity**: The User authenticates by connecting their **Web3 Wallet** (MetaMask) via Ethers.js in the frontend.
3. **Minting (Tokenization)**: When a user wants to mint a coin, the Frontend prompts the Web3 Wallet for a signature and sends a transaction to the **NumisferaNFT (ERC-721)** smart contract. At the same time, the off-chain metadata (image URLs, specs, history) remains securely stored in the Backend.
4. **Auctioning**: The user launches an auction via the frontend, communicating directly with the **NumisferaAuction** contract to lock the NFT and set conditions. The Frontend also informs the Backend to reflect the "Active Auction" visually on the site without waiting for purely blockchain reads on every page load.
5. **Settlement**: Upon expiration (handled in UTC using `Instant` on the backend), the winner or owner triggers the smart contract settlement. Once confirmed by the Blockchain, the backend synchronizes the new ownership internally.
