import { ethers } from "ethers";

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY!;
const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY!;
const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS!;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL!;

// ✅ **上傳圖片到 IPFS**
export const uploadToIPFS = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const metadata = JSON.stringify({ name: file.name });
    formData.append("pinataMetadata", metadata);
    formData.append("pinataOptions", JSON.stringify({ cidVersion: 0 }));

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
            "pinata_api_key": PINATA_API_KEY,
            "pinata_secret_api_key": PINATA_SECRET_API_KEY,
        },
        body: formData,
    });

    const data = await res.json();
    return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
};

// ✅ **匯出 NFT 相關函數**
export const createNFTMetadata = async (imageCID: string, name: string, description: string) => {
    const metadata = { name, description, image: imageCID };

    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "pinata_api_key": PINATA_API_KEY,
            "pinata_secret_api_key": PINATA_SECRET_API_KEY,
        },
        body: JSON.stringify(metadata),
    });

    const data = await res.json();
    return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
};

// ✅ **匯出 mintNFT**
export const mintNFT = async (tokenURI: string) => {
    if (typeof window === "undefined" || !window.ethereum) {
        alert("請安裝 Metamask 擴充功能！");
        return;
    }

    try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const nftContract = new ethers.Contract(
            NFT_CONTRACT_ADDRESS,
            ["function mintNFT(string memory) external returns (uint256)"],
            signer
        );

        console.log("🚀 正在鑄造 NFT...");
        const tx = await nftContract.mintNFT(tokenURI);
        const receipt = await tx.wait();
        console.log("✅ 交易成功！");

        const tokenId = receipt.logs[0].args.tokenId;
        alert(`✅ NFT 鑄造成功！Token ID: ${tokenId}`);
    } catch (error) {
       
    }
};
