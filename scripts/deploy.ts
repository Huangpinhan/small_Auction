import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    // 🔹 取得部署者帳戶
    const [deployer] = await ethers.getSigners();
    console.log("🚀 Deploying contracts with account:", deployer.address);

    // 🔹 取得當前 Gas 費
    const feeData = await ethers.provider.getFeeData();
    const maxFeePerGas = feeData.maxFeePerGas ? feeData.maxFeePerGas * 3n : ethers.parseUnits("50", "gwei");
    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ? feeData.maxPriorityFeePerGas * 3n : ethers.parseUnits("10", "gwei");

    console.log(`⛽ Max Fee Per Gas: ${ethers.formatUnits(maxFeePerGas, "gwei")} Gwei`);
    console.log(`⛽ Max Priority Fee Per Gas: ${ethers.formatUnits(maxPriorityFeePerGas, "gwei")} Gwei`);

    try {
        // 🔹 1️⃣ 部署 MyNFT 合約
        console.log("\n🔹 Deploying MyNFT...");
        const MyNFT = await ethers.getContractFactory("MyNFT");
        const myNFT = await MyNFT.deploy({
            maxFeePerGas: maxFeePerGas,
            maxPriorityFeePerGas: maxPriorityFeePerGas
        });
        await myNFT.waitForDeployment();
        const myNFTAddress = await myNFT.getAddress();
        console.log("✅ MyNFT deployed at:", myNFTAddress);

        // 🔹 2️⃣ 部署 AuctionFactory 合約（已移除 Verifier 參數）
        console.log("\n🔹 Deploying AuctionFactory...");
        const AuctionFactory = await ethers.getContractFactory("AuctionFactory");
        const auctionFactory = await AuctionFactory.deploy({
            maxFeePerGas: maxFeePerGas,
            maxPriorityFeePerGas: maxPriorityFeePerGas
        });
        await auctionFactory.waitForDeployment();
        const auctionFactoryAddress = await auctionFactory.getAddress();
        console.log("✅ AuctionFactory deployed at:", auctionFactoryAddress);

        console.log("\n🎯 部署完成！現在你可以透過 `AuctionFactory` 來創建新拍賣。");
    } catch (error) {
        console.error("❌ 部署失敗:", error);
        process.exitCode = 1;
    }
}

// 執行部署
main();
