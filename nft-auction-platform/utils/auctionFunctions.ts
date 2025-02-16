import { ethers } from "ethers";

const AUCTION_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_AUCTION_FACTORY_ADDRESS!;
const AUCTION_FACTORY_ABI = [
    "event AuctionCreated(address indexed auctionAddress, address indexed owner, address indexed nftContract, uint256 tokenId, uint256 endTime)",
    "function createAuction(uint256 endTime, address nftContract, uint256 tokenId) external returns (address)"
];

const NFT_ABI = [
    "function approve(address to, uint256 tokenId) external",
    "function ownerOf(uint256 tokenId) external view returns (address)",
    "function getApproved(uint256 tokenId) external view returns (address)",
    "function transferFrom(address from, address to, uint256 tokenId) external"
];

export async function createAuction(nftContract: string, tokenId: number, duration: number): Promise<string> {
    if (typeof window.ethereum === "undefined") {
        throw new Error("請連接 MetaMask 或其他 Web3 錢包");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const auctionFactory = new ethers.Contract(AUCTION_FACTORY_ADDRESS, AUCTION_FACTORY_ABI, signer);
    const nft = new ethers.Contract(nftContract, NFT_ABI, signer);

    const endTime = Math.floor(Date.now() / 1000) + duration;

    try {
        console.log("🚀 創建拍賣合約...");
        const tx = await auctionFactory.createAuction(endTime, nftContract, tokenId);
        const receipt = await tx.wait();
        console.log("✅ 拍賣合約創建成功");

        // ✅ 解析 `AuctionCreated` 事件
        const auctionCreatedEvent = receipt.logs
            .map((log:any) => {
                try {
                    return auctionFactory.interface.parseLog(log);
                } catch (err) {
                    return null;
                }
            })
            .find((log:any) => log?.name === "AuctionCreated");

        if (!auctionCreatedEvent) {
            throw new Error("找不到 `AuctionCreated` 事件，請檢查交易記錄！");
        }

        // ✅ 獲取 `auctionAddress`
        const auctionAddress = auctionCreatedEvent.args.auctionAddress;
        console.log("🏆 成功創建拍賣，合約地址:", auctionAddress);

        console.log("🚀 檢查 NFT 擁有權...");
        const owner = await nft.ownerOf(tokenId);
        if (owner.toLowerCase() !== signer.address.toLowerCase()) {
            throw new Error("❌ 你不是該 NFT 的擁有者");
        }

        console.log("🔹 允許拍賣合約轉移 NFT...");
        const approveTx = await nft.approve(auctionAddress, tokenId);
        await approveTx.wait();
        console.log("✅ NFT 授權成功");

        console.log("🔹 NFT 轉移到拍賣合約...");
        const transferTx = await nft.transferFrom(signer.address, auctionAddress, tokenId);
        await transferTx.wait();
        console.log("✅ NFT 轉移成功");

        return auctionAddress;
    } catch (error) {
        console.error("❌ 創建拍賣失敗:", error);
        throw error;
    }
}

/**
 * @dev 獲取所有拍賣
 * @returns Auction 陣列
 */
export async function getAllAuctions() {
    if (typeof window.ethereum === "undefined") {
        throw new Error("請連接 MetaMask 或其他 Web3 錢包");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const auctionFactory = new ethers.Contract(AUCTION_FACTORY_ADDRESS, AUCTION_FACTORY_ABI, provider);

    try {
        const auctions = await auctionFactory.getAllAuctions();
        return auctions.map((auction: any) => ({
            auctionAddress: auction[0],
            owner: auction[1],
            nftContract: auction[2],
            tokenId: Number(auction[3]),
            endTime: Number(auction[4])
        }));
    } catch (error) {
        console.error("❌ 無法獲取所有拍賣:", error);
        throw error;
    }
}
