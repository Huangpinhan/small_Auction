
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";

const AUCTION_ABI = [
    "function getAuctionDetails() external view returns (uint256, uint256, address, bool, bool, uint256)",
    "function tokenId() external view returns (uint256)",
    "function submitBid() external payable"
];

const NFT_ABI = [
    "function tokenURI(uint256 tokenId) external view returns (string)"
];

const ORACLE_ABI = [
    "function getMaticPrice(string currency) external view returns (int256)"
];

const NFT_CONTRACT_ADDRESS = "0xe1B596b51B78888BFdC2fe6221e306a053D3556C"; // NFT 合約地址
const ORACLE_ADDRESS = "0x4E4A26DBf22319D3Ec3770Fe5936B7B6c430eEA6"; // MaticPriceOracle 合約地址
const USD_TWD_API = "https://api.exchangerate-api.com/v4/latest/USD"; // 取得 USD/TWD 匯率的 API

export default function AuctionPage() {
    const router = useRouter();
    const { id } = router.query; // 拍賣合約地址
    const [auction, setAuction] = useState<any>(null);
    const [bidAmount, setBidAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [nftMetadata, setNftMetadata] = useState<any>(null);
    const [tokenId, setTokenId] = useState<number | null>(null);
    const [maticUsd, setMaticUsd] = useState<number | null>(null);
    const [usdTwd, setUsdTwd] = useState<number | null>(null);
    const [maticTwd, setMaticTwd] = useState<number | null>(null);
    const [calculatedTWD, setCalculatedTWD] = useState<number | null>(null);

    useEffect(() => {
        if (id) {
            fetchAuctionDetails();
            fetchTokenId();
        }
        fetchExchangeRates();
        const interval = setInterval(fetchExchangeRates, 1000); // 每秒更新匯率
        return () => clearInterval(interval);
    }, [id]);

    const fetchAuctionDetails = async () => {
        try {
            if (!window.ethereum) throw new Error("請連接 MetaMask");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(id as string, AUCTION_ABI, provider);

            const [startTime, endTime, highestBidder, ended, nftDeposited, highestBid] = await contract.getAuctionDetails();
            setAuction({
                startTime: Number(startTime),
                endTime: Number(endTime),
                highestBidder,
                ended,
                nftDeposited,
                highestBid: ethers.formatEther(highestBid)
            });
        } catch (error) {
            console.error("❌ 獲取拍賣詳情失敗:", error);
        }
    };

    const fetchTokenId = async () => {
        try {
            if (!window.ethereum) throw new Error("請連接 MetaMask");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const auctionContract = new ethers.Contract(id as string, AUCTION_ABI, provider);

            const fetchedTokenId = await auctionContract.tokenId();
            setTokenId(Number(fetchedTokenId));
            fetchNFTMetadata(Number(fetchedTokenId));
        } catch (error) {
            console.error("❌ 無法獲取 tokenId:", error);
        }
    };

    const fetchNFTMetadata = async (tokenId: number) => {
        try {
            if (!window.ethereum) throw new Error("請連接 MetaMask");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);

            const metadataURI = await nftContract.tokenURI(tokenId);
            const response = await fetch(metadataURI);
            const metadata = await response.json();
            setNftMetadata(metadata);
        } catch (error) {
            console.error("❌ 獲取 NFT Metadata 失敗:", error);
        }
    };

    const fetchExchangeRates = async () => {
        try {
            if (!window.ethereum) throw new Error("請連接 MetaMask");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const oracle = new ethers.Contract(ORACLE_ADDRESS, ORACLE_ABI, provider);

            const price = await oracle.getMaticPrice("USD");
            const formattedPrice = Number(ethers.formatUnits(price, 8));
            setMaticUsd(formattedPrice);

            const response = await fetch(USD_TWD_API);
            const data = await response.json();
            const twdRate = data.rates["TWD"];
            setUsdTwd(twdRate);

            if (formattedPrice && twdRate) {
                setMaticTwd(formattedPrice * twdRate);
            }
        } catch (error) {
            console.error(`❌ 獲取匯率失敗:`, error);
        }
    };

    const calculateTWDValue = (maticAmount: string) => {
        if (!maticTwd || isNaN(Number(maticAmount))) {
            setCalculatedTWD(null);
            return;
        }
        setCalculatedTWD(Number(maticAmount) * maticTwd);
    };

    const handleBid = async () => {
        if (!bidAmount || isNaN(Number(bidAmount)) || Number(bidAmount) <= 0) {
            alert("⚠️ 請輸入有效的競標金額！");
            return;
        }

        setIsSubmitting(true);

        try {
            if (!window.ethereum) throw new Error("請連接 MetaMask");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(id as string, AUCTION_ABI, signer);

            const tx = await contract.submitBid({ value: ethers.parseEther(bidAmount) });
            await tx.wait();

            alert("🎉 競標成功！");
            fetchAuctionDetails();
        } catch (error) {
            console.error("❌ 競標失敗:", error);
            alert("❌ 競標失敗，請稍後重試！");
        }

        setIsSubmitting(false);
    };

    return (
        <div className="container">
            <h1>🛒 拍賣詳情</h1>
            {auction ? (
                <>
                    <p><strong>📌 拍賣地址:</strong> {id}</p>
                    <p><strong>👤 最高出價者:</strong> {auction.highestBidder || "無"}</p>
                    <p><strong>⌛ 拍賣結束時間:</strong> {new Date(auction.endTime * 1000).toLocaleString()}</p>
                    <p><strong>💰 目前最高出價:</strong> {auction.highestBid} POL</p>

                    {maticTwd !== null ? (
                        <>
                            <p><strong>💲 POL/TWD:</strong> {maticTwd?.toFixed(2)} TWD</p>
                        </>
                    ) : (
                        <p>⏳ 加載匯率中...</p>
                    )}
                    {nftMetadata && (
                        <div>
                            <h3>🖼 NFT 詳情</h3>
                            <img src={nftMetadata.image} alt={nftMetadata.name} width="500"/>
                            <p><strong>名稱:</strong> {nftMetadata.name}</p>
                            <p><strong>描述:</strong> {nftMetadata.description}</p>
                        </div>
                    )}

                    <h3>💰 競標</h3>
                    <input
                        type="number"
                        placeholder="輸入你的競標金額 (POL)"
                        value={bidAmount}
                        onChange={(e) => {
                            setBidAmount(e.target.value);
                            calculateTWDValue(e.target.value);
                        }}
                    />
                    <p><strong>🔹 估算金額:</strong> {calculatedTWD?.toFixed(2)} TWD</p>

                    {!auction.ended && (
                        <button onClick={handleBid} disabled={isSubmitting}>
                            {isSubmitting ? "⏳ 競標中..." : "⚡ 提交競標"}
                        </button>
                    )}
                </>
            ) : (
                <p>⏳ 加載中...</p>
            )}
        </div>
    );
}
