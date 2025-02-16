import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-circom";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      { version: "0.8.19" },
      { version: "0.8.20" }, // ✅ 確保支援 OpenZeppelin 所需版本
      { version: "0.8.28" }, // ✅ 確保支援 Lock.sol 版本
    ],
  },
  paths:{
    sources: "./contracts",
    artifacts:"./artifacts"
  },
  circom: {
    inputBasePath: "./circuits",
    outputBasePath: "./build/circuits",
    ptau: "./circuits/ptau/powersOfTau28_hez_final_10.ptau",
    circuits: [{ name: "bulletproof" }],
  },
  networks: {
    polygon: {
      url: process.env.ALCHEMY_API_URL || "",
      accounts: process.env.PRIVATE_KEY ? [`0x${process.env.PRIVATE_KEY}`] : [],
    },
  },
};

export default config;
