
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";

const AUCTION_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_AUCTION_FACTORY_ADDRESS!;
const AUCTION_FACTORY_ABI = [
    "function getAllAuctions() external view returns (tuple(address auctionAddress, address owner, address nftContract, uint256 tokenId, uint256 endTime)[])"
];

interface Auction {
    auctionAddress: string;
    owner: string;
    nftContract: string;
    tokenId: number;
    endTime: number;
}

export default function Home() {
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== "undefined") {
            fetchAuctions();
        }
    }, []);

    const fetchAuctions = async () => {
        try {
            if (typeof window.ethereum === "undefined") {
                console.error("⚠️ MetaMask 未安裝");
                return;
            }
            
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(AUCTION_FACTORY_ADDRESS, AUCTION_FACTORY_ABI, provider);

            const auctionsData = await contract.getAllAuctions();
            const formattedAuctions = auctionsData.map((auction: any) => ({
                auctionAddress: auction[0],
                owner: auction[1],
                nftContract: auction[2],
                tokenId: Number(auction[3]),
                endTime: Number(auction[4])
            }));

            setAuctions(formattedAuctions);
        } catch (error) {
            console.error("❌ 無法獲取拍賣列表:", error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col items-center p-6"
            style={{
                backgroundColor: "#8247E5", // Polygon 主色
                color: "white"
            }}
        >
            <h1 className="text-4xl font-bold mb-6">🎉 盲盒 NFT 拍賣</h1>

            {/* 按鈕區塊 */}
            <div className="flex space-x-4 mb-6">
                <button 
                    onClick={() => router.push("./create-auction")}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition"
                >
                    ➕ 創建新拍賣
                </button>

                <button 
                    onClick={() => router.push("./mint")}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition"
                >
                    🎨 鑄造 NFT
                </button>
            </div>

            {/* 拍賣列表 */}
            {loading ? (
                <p className="text-lg">⏳ 加載中...</p>
            ) : auctions.length === 0 ? (
                <p className="text-lg">⚠️ 目前沒有進行中的拍賣</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
                    {auctions.map((auction) => (
                        <div 
                            key={auction.auctionAddress} 
                            className="bg-white text-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col space-y-2"
                        >
                            <p className="text-sm"><strong>📌 拍賣地址:</strong> {auction.auctionAddress}</p>
                            <p className="text-sm"><strong>👤 賣家:</strong> {auction.owner}</p>
                            <p className="text-sm"><strong>🏷️ NFT 合約:</strong> {auction.nftContract}</p>
                            <p className="text-sm"><strong>🔹 Token ID:</strong> {auction.tokenId}</p>
                            <p className="text-sm"><strong>⌛ 結束時間:</strong> {new Date(auction.endTime * 1000).toLocaleString()}</p>

                            <button 
                                onClick={() => router.push(`/auctions/${auction.auctionAddress}`)}
                                className="mt-4 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition w-full"
                            >
                                參與拍賣 ➡️
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
