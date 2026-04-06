import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "cancun"
    }
  },
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      chainId: 1337 // Default for Ganache UI
    },
    // The public Testnet network (No real money involved)
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "", // Alchemy or Infura URL
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111
    }
  }
};
