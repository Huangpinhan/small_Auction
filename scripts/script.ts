import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

async function main() {
    // 取得部署者帳戶
    const [deployer] = await ethers.getSigners();
    console.log("🚀 Using account:", deployer.address);

    // 1️⃣ 查詢最新的 nonce
    const latestNonce = await ethers.provider.getTransactionCount(deployer.address, "latest");
    console.log(`🔍 Latest confirmed nonce: ${latestNonce}`);


    // 2️⃣ 設定更高 Gas 費（EIP-1559）
    const feeData = await ethers.provider.getFeeData();

    const maxFeePerGas = feeData.maxFeePerGas ? feeData.maxFeePerGas * 3n : ethers.parseUnits("50", "gwei");
    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ? feeData.maxPriorityFeePerGas * 3n : ethers.parseUnits("10", "gwei");

    console.log(`🚀 強制覆蓋 nonce ，Max Fee: ${ethers.formatUnits(maxFeePerGas, "gwei")} Gwei`);
    console.log(`🚀 強制覆蓋 nonce ，Max Priority Fee: ${ethers.formatUnits(maxPriorityFeePerGas, "gwei")} Gwei`);

    // 3️⃣ 發送 0 MATIC 交易來覆蓋stuck nonce 
    const overrideTx = await deployer.sendTransaction({
        to: deployer.address, // 發送給自己
        value: ethers.parseEther("0"), // 0 MATIC
        gasLimit: 21000, // 標準 Gas 限制
        maxFeePerGas: maxFeePerGas, // EIP-1559 最大 Gas 費
        maxPriorityFeePerGas: maxPriorityFeePerGas, // EIP-1559 優先費
        nonce: 33 // 強制覆蓋 nonce 29
    });

    console.log(`✅ 強制替換交易已發送: ${overrideTx.hash}`);

    // 4️⃣ 等待交易確認
    const receipt = await overrideTx.wait(2); // 等待 2 個區塊確認

    if (!receipt) {
        console.error("❌ 交易未確認，請稍後再試！");
        return;
    }

    console.log(`🎉 Nonce 29 交易成功替換！區塊號: ${receipt.blockNumber}`);

   
}



main().catch((error) => {
    console.error("❌ 交易失敗:", error);
    process.exitCode = 1;
});
