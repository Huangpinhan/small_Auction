import { useState } from "react";
import { uploadToIPFS, createNFTMetadata, mintNFT } from "../utils/nftFunctions";

const MintNFT = () => {
    const [file, setFile] = useState<File | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
        }
    };

    const mintNFTProcess = async () => {
        if (!file || !name || !description) {
            alert("請填寫完整資訊！");
            return;
        }
        setLoading(true);
        try {
            console.log("📤 上傳圖片到 IPFS...");
            const imageCID = await uploadToIPFS(file);
            console.log("✅ 圖片上傳成功:", imageCID);

            console.log("📤 生成 NFT Metadata...");
            const tokenURI = await createNFTMetadata(imageCID, name, description);
            console.log("✅ Metadata 上傳成功:", tokenURI);

            console.log("🚀 開始鑄造 NFT...");
            await mintNFT(tokenURI);
            alert("✅ NFT 鑄造成功！");
        } catch (error) {
           
        }
        setLoading(false);
    };

    return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
            <h2 className="text-xl font-bold text-center">鑄造你的 NFT</h2>
            <input type="file" accept="image/*" onChange={handleFileChange} className="w-full p-2 border rounded" />
            <input type="text" placeholder="NFT 名稱" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded" />
            <textarea placeholder="描述 NFT" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border rounded"></textarea>
            <button onClick={mintNFTProcess} className="w-full p-2 bg-blue-500 text-white rounded" disabled={loading}>
                {loading ? "鑄造中..." : "🚀 鑄造 NFT"}
            </button>
        </div>
    );
};

export default MintNFT;
