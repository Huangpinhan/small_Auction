
import { useState } from "react";
import { createAuction } from "../utils/auctionFunctions";
import { useRouter } from "next/router";

export default function CreateAuction() {
    const [nftContract, setNftContract] = useState("");
    const [tokenId, setTokenId] = useState("");
    const [duration, setDuration] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCreateAuction = async () => {
        if (!nftContract || !tokenId || !duration) {
            alert("請填寫所有欄位！");
            return;
        }

        setLoading(true);

        try {
            const auctionAddress = await createAuction(nftContract, Number(tokenId), Number(duration));
            alert(`🎉 拍賣成功創建！合約地址：${auctionAddress}`);
            router.push("/");
        } catch (error) {
            alert("❌ 創建拍賣失敗，請稍後重試！");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">➕ 創建新拍賣</h1>
            {/* 🔹 回到首頁按鈕 */}
            <button
                    onClick={() => router.push("/")}
                    className="mt-4 w-full py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition"
                >
                    ⬅️ 回到首頁
                </button>
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <input
                    type="text"
                    placeholder="NFT 合約地址"
                    value={nftContract}
                    onChange={(e) => setNftContract(e.target.value)}
                    className="w-full p-2 border rounded-lg mb-4"
                />
                <input
                    type="number"
                    placeholder="Token ID"
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                    className="w-full p-2 border rounded-lg mb-4"
                />
                <input
                    type="number"
                    placeholder="拍賣時長 (秒)"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full p-2 border rounded-lg mb-4"
                />

                <button
                    onClick={handleCreateAuction}
                    disabled={loading}
                    className={`w-full py-2 text-white font-semibold rounded-lg transition ${
                        loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                    }`}
                >
                    {loading ? "⏳ 創建中..." : "🚀 創建拍賣"}
                </button>

                
            </div>
        </div>
    );
}
