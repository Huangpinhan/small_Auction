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
        // 🔹 部署 MaticPriceOracle 合約
        console.log("\n🔹 Deploying MaticPriceOracle...");
        const MaticPriceOracle = await ethers.getContractFactory("MaticPriceOracle");
        const oracle = await MaticPriceOracle.deploy({
            maxFeePerGas: maxFeePerGas,
            maxPriorityFeePerGas: maxPriorityFeePerGas
        });
        await oracle.waitForDeployment();
        const oracleAddress = await oracle.getAddress();
        console.log("✅ MaticPriceOracle deployed at:", oracleAddress);

        console.log("\n🎯 部署完成！你現在可以使用 `MaticPriceOracle` 來獲取 MATIC 匯率。");
    } catch (error) {
        console.error("❌ 部署失敗:", error);
        process.exitCode = 1;
    }
}

// 執行部署
main();
