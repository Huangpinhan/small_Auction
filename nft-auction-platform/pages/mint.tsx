
import { useRouter } from "next/router";
import MintNFT from "../components/MintNFT";

const MintPage = () => {
    const router = useRouter();

    return (
        <div 
            className="flex flex-col items-center justify-center min-h-screen p-6"
            style={{
               
                color: "black"
            }}
        >
            <h1 className="text-4xl font-bold mb-6">🎨 鑄造 NFT</h1>

            {/* 🔹 回到首頁按鈕 */}
            <button 
                onClick={() => router.push("/")} 
                className="mb-6 px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg shadow-lg hover:bg-gray-800 transition"
            >
                ⬅️ 回到首頁
            </button>

            {/* 🔹 鑄造 NFT 區塊 */}
            <div className="bg-white text-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 max-w-md w-full">
                <MintNFT />
            </div>
        </div>
    );
};

export default MintPage;
