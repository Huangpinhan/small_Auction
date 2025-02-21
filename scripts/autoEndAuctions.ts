import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const AUCTION_FACTORY_ADDRESS = "0x你的工廠合約地址"; // 需要填入工廠合約地址
const AUCTION_FACTORY_ABI = [
    "function getAllAuctions() external view returns (tuple(address auctionAddress, address owner, address nftContract, uint256 tokenId, uint256 endTime)[])"
];

const AUCTION_ABI = [
    "function getAuctionDetails() external view returns (uint256 startTime, uint256 endTime, address highestBidder, bool ended, bool nftDeposited, uint256 highestBid)",
    "function endAuction() external"
];

// ✅ 延遲函數，避免 CPU 過度使用
function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function monitorAuctions() {
    const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_API_URL);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);

    console.log("🚀 自動結束拍賣腳本啟動，使用帳戶:", signer.address);

    while (true) {
        try {
            // 連接工廠合約
            const auctionFactory = new ethers.Contract(AUCTION_FACTORY_ADDRESS, AUCTION_FACTORY_ABI, provider);

            console.log("📌 獲取所有拍賣...");
            const auctions = await auctionFactory.getAllAuctions();

            let auctionsEnded = 0;
            const now = Math.floor(Date.now() / 1000);

            for (const auction of auctions) {
                const auctionAddress = auction[0];
                const auctionContract = new ethers.Contract(auctionAddress, AUCTION_ABI, signer);

                const auctionDetails = await auctionContract.getAuctionDetails();
                const endTime = Number(auctionDetails.endTime);
                const ended = auctionDetails.ended;

                if (!ended && now >= endTime) {
                    console.log(`⌛ 拍賣 ${auctionAddress} 已結束，執行結算...`);

                    try {
                        const tx = await auctionContract.endAuction();
                        await tx.wait();
                        console.log(`✅ 拍賣 ${auctionAddress} 成功完成！`);
                        auctionsEnded++;
                    } catch (error) {
                        console.error(`❌ 結束拍賣 ${auctionAddress} 失敗:`, error);
                    }
                }
            }

            if (auctionsEnded === 0) {
                console.log("⚡ 沒有需要完成的拍賣。");
            } else {
                console.log(`🎯 已完成 ${auctionsEnded} 個拍賣。`);
            }
        } catch (error) {
            console.error("❌ 自動結束拍賣腳本錯誤:", error);
        }

        console.log("⏳ 等待 10 秒後再次檢查...");
        await sleep(10000); // 每 60 秒執行一次
    }
}

// 執行腳本
monitorAuctions().catch((error) => {
    console.error("❌ 自動結束拍賣腳本錯誤:", error);
    process.exitCode = 1;
});
