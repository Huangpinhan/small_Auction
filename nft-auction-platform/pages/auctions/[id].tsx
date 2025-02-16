
// import { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import { ethers } from "ethers";

// const AUCTION_ABI = [
//     "function getAuctionDetails() external view returns (uint256, uint256, address, bool, bool, uint256)",
//     "function submitBid() external payable"
// ];

// const ORACLE_ABI = [
//     "function getMaticPrice(string currency) external view returns (int256)"
// ];

// const ORACLE_ADDRESS = "0x4E4A26DBf22319D3Ec3770Fe5936B7B6c430eEA6"; // 🔹 MaticPriceOracle 合約地址
// const USD_TWD_API = "https://api.exchangerate-api.com/v4/latest/USD"; // 🔹 取得 USD/TWD 匯率的 API

// export default function AuctionPage() {
//     const router = useRouter();
//     const { id } = router.query; // 拍賣合約地址
//     const [auction, setAuction] = useState<any>(null);
//     const [bidAmount, setBidAmount] = useState("");
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [maticUsd, setMaticUsd] = useState<number | null>(null);
//     const [usdTwd, setUsdTwd] = useState<number | null>(null);
//     const [maticTwd, setMaticTwd] = useState<number | null>(null); // **這裡只存 POL/TWD 匯率**
//     const [calculatedTWD, setCalculatedTWD] = useState<number | null>(null); // **這裡存輸入金額的台幣價值**

//     useEffect(() => {
//         if (id) fetchAuctionDetails();
//         fetchExchangeRates(); // 初次加載
//         const interval = setInterval(fetchExchangeRates, 1000); // 每秒更新匯率
//         return () => clearInterval(interval);
//     }, [id]); // 依賴 id 來確保正確加載數據

//     const fetchAuctionDetails = async () => {
//         try {
//             if (!window.ethereum) throw new Error("請連接 MetaMask");
//             const provider = new ethers.BrowserProvider(window.ethereum);
//             const contract = new ethers.Contract(id as string, AUCTION_ABI, provider);

//             const [startTime, endTime, highestBidder, ended, nftDeposited, highestBid] = await contract.getAuctionDetails();
//             setAuction({
//                 startTime: Number(startTime),
//                 endTime: Number(endTime),
//                 highestBidder,
//                 ended,
//                 nftDeposited,
//                 highestBid: ethers.formatEther(highestBid) // 轉換為 MATIC
//             });
//         } catch (error) {
//             console.error("❌ 獲取拍賣詳情失敗:", error);
//         }
//     };

//     const fetchExchangeRates = async () => {
//         try {
//             if (!window.ethereum) throw new Error("請連接 MetaMask");
//             const provider = new ethers.BrowserProvider(window.ethereum);
//             const oracle = new ethers.Contract(ORACLE_ADDRESS, ORACLE_ABI, provider);

//             // 🔹 從 Chainlink Oracle 獲取 POL/USD
//             const price = await oracle.getMaticPrice("USD");
//             const formattedPrice = Number(ethers.formatUnits(price, 8)); // 轉換格式
//             setMaticUsd(formattedPrice);
//             console.log(`📈 POL/USD:`, formattedPrice);

//             // 🔹 從外部 API 獲取 USD/TWD
//             const response = await fetch(USD_TWD_API);
//             const data = await response.json();
//             const twdRate = data.rates["TWD"];
//             setUsdTwd(twdRate);
//             console.log(`📈 USD/TWD:`, twdRate);

//             // 🔹 計算 POL/TWD（這裡不會被輸入影響！）
//             if (formattedPrice && twdRate) {
//                 const calculatedMaticTwd = formattedPrice * twdRate;
//                 setMaticTwd(calculatedMaticTwd);
//                 console.log(`📈 正確的 POL/TWD:`, calculatedMaticTwd);
//             }
//         } catch (error) {
//             console.error(`❌ 獲取匯率失敗:`, error);
//         }
//     };

//     // 🔹 這裡只計算競標金額的台幣價值，**不會影響匯率**
//     const calculateTWDValue = (maticAmount: string) => {
//         if (!maticTwd || isNaN(Number(maticAmount))) {
//             setCalculatedTWD(null);
//             return;
//         }
//         setCalculatedTWD(Number(maticAmount) * maticTwd);
//     };

//     const handleBid = async () => {
//         if (!bidAmount || isNaN(Number(bidAmount)) || Number(bidAmount) <= 0) {
//             alert("⚠️ 請輸入有效的競標金額！");
//             return;
//         }

//         setIsSubmitting(true);

//         try {
//             const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
//             const signer = await provider.getSigner();
//             const contract = new ethers.Contract(id as string, AUCTION_ABI, signer);

//             const tx = await contract.submitBid({ value: ethers.parseEther(bidAmount) });
//             await tx.wait();

//             alert("🎉 競標成功！");
//             fetchAuctionDetails();
//         } catch (error) {
//             console.error("❌ 競標失敗:", error);
//             alert("❌ 競標失敗，請稍後重試！");
//         }

//         setIsSubmitting(false);
//     };

//     return (
//         <div className="container">
//             <h1>🛒 拍賣詳情</h1>
//             {auction ? (
//                 <>
//                     <p><strong>📌 拍賣地址:</strong> {id}</p>
//                     <p><strong>👤 最高出價者:</strong> {auction.highestBidder || "無"}</p>
//                     <p><strong>⌛ 拍賣結束時間:</strong> {new Date(auction.endTime * 1000).toLocaleString()}</p>
//                     <p><strong>💰 目前最高出價:</strong> {auction.highestBid} POL</p>
                    
//                     {maticUsd !== null && usdTwd !== null && maticTwd !== null ? (
//                         <>
//                             <p><strong>💲 POL/USD:</strong> {maticUsd.toFixed(4)} USD</p>
//                             <p><strong>💲 USD/TWD:</strong> {usdTwd.toFixed(2)} TWD</p>
//                             <p><strong>💲 POL/TWD:</strong> {maticTwd.toFixed(2)} TWD</p>
//                         </>
//                     ) : (
//                         <p>⏳ 加載匯率中...</p>
//                     )}

//                     {auction.ended ? (
//                         <p>⚠️ 拍賣已結束</p>
//                     ) : (
//                         <div>
//                             <h3>💰 提交競標</h3>
//                             <input
//                                 type="number"
//                                 placeholder="輸入你的競標金額 (POL)"
//                                 value={bidAmount}
//                                 onChange={(e) => {
//                                     setBidAmount(e.target.value);
//                                     calculateTWDValue(e.target.value);
//                                 }}
//                             />

//                             {calculatedTWD !== null && !isNaN(calculatedTWD) && (
//                                 <p><strong>🔹 估算金額:</strong> {calculatedTWD.toFixed(2)} TWD</p>
//                             )}

//                             <button onClick={handleBid} disabled={isSubmitting}>
//                                 {isSubmitting ? "⏳ 競標中..." : "⚡ 提交競標"}
//                             </button>
//                         </div>
//                     )}
//                 </>
//             ) : (
//                 <p>⏳ 加載中...</p>
//             )}
//         </div>
//     );
// }

// import { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import { ethers } from "ethers";

// const AUCTION_ABI = [
//     "function getAuctionDetails() external view returns (uint256, uint256, address, bool, bool, uint256)",
//     "function tokenId() external view returns (uint256)" // 🔹 獲取拍賣的 NFT tokenId
// ];

// const NFT_ABI = [
//     "function tokenURI(uint256 tokenId) external view returns (string)"
// ];

// const ORACLE_ABI = [
//     "function getMaticPrice(string currency) external view returns (int256)"
// ];

// const NFT_CONTRACT_ADDRESS = "0xeE21F63Fc85C62C62488f2Cfa61a6051950c699E"; // 🔹 你的 NFT 合約地址
// const ORACLE_ADDRESS = "0x4E4A26DBf22319D3Ec3770Fe5936B7B6c430eEA6"; // 🔹 MaticPriceOracle 合約地址
// const USD_TWD_API = "https://api.exchangerate-api.com/v4/latest/USD"; // 🔹 取得 USD/TWD 匯率的 API

// export default function AuctionPage() {
//     const router = useRouter();
//     const { id } = router.query; // 拍賣合約地址
//     const [auction, setAuction] = useState<any>(null);
//     const [bidAmount, setBidAmount] = useState("");
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [maticUsd, setMaticUsd] = useState<number | null>(null);
//     const [usdTwd, setUsdTwd] = useState<number | null>(null);
//     const [maticTwd, setMaticTwd] = useState<number | null>(null);
//     const [calculatedTWD, setCalculatedTWD] = useState<number | null>(null);
//     const [nftMetadata, setNftMetadata] = useState<any>(null);
//     const [tokenId, setTokenId] = useState<number | null>(null); // 🔹 NFT Token ID

//     useEffect(() => {
//         if (id) {
//             fetchAuctionDetails();
//             fetchTokenId();
//         }
//         fetchExchangeRates();
//         const interval = setInterval(fetchExchangeRates, 1000);
//         return () => clearInterval(interval);
//     }, [id]);

//     const fetchAuctionDetails = async () => {
//         try {
//             if (!window.ethereum) throw new Error("請連接 MetaMask");
//             const provider = new ethers.BrowserProvider(window.ethereum);
//             const contract = new ethers.Contract(id as string, AUCTION_ABI, provider);

//             const [startTime, endTime, highestBidder, ended, nftDeposited, highestBid] = await contract.getAuctionDetails();
//             setAuction({
//                 startTime: Number(startTime),
//                 endTime: Number(endTime),
//                 highestBidder,
//                 ended,
//                 nftDeposited,
//                 highestBid: ethers.formatEther(highestBid)
//             });
//         } catch (error) {
//             console.error("❌ 獲取拍賣詳情失敗:", error);
//         }
//     };

//     const fetchTokenId = async () => {
//         try {
//             if (!window.ethereum) throw new Error("請連接 MetaMask");
//             const provider = new ethers.BrowserProvider(window.ethereum);
//             const auctionContract = new ethers.Contract(id as string, AUCTION_ABI, provider);

//             const fetchedTokenId = await auctionContract.tokenId();
//             setTokenId(Number(fetchedTokenId));
//             console.log(`🎯 獲取到的 Token ID:`, fetchedTokenId);

//             fetchNFTMetadata(Number(fetchedTokenId));
//         } catch (error) {
//             console.error("❌ 無法獲取 tokenId:", error);
//         }
//     };

//     const fetchExchangeRates = async () => {
//         try {
//             if (!window.ethereum) throw new Error("請連接 MetaMask");
//             const provider = new ethers.BrowserProvider(window.ethereum);
//             const oracle = new ethers.Contract(ORACLE_ADDRESS, ORACLE_ABI, provider);

//             const price = await oracle.getMaticPrice("USD");
//             const formattedPrice = Number(ethers.formatUnits(price, 8));
//             setMaticUsd(formattedPrice);

//             const response = await fetch(USD_TWD_API);
//             const data = await response.json();
//             const twdRate = data.rates["TWD"];
//             setUsdTwd(twdRate);

//             if (formattedPrice && twdRate) {
//                 setMaticTwd(formattedPrice * twdRate);
//             }
//         } catch (error) {
//             console.error(`❌ 獲取匯率失敗:`, error);
//         }
//     };

//     // 🔹 獲取 NFT Metadata
//     const fetchNFTMetadata = async (tokenId: number) => {
//         try {
//             if (!window.ethereum) throw new Error("請連接 MetaMask");
//             const provider = new ethers.BrowserProvider(window.ethereum);
//             const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);

//             const metadataURI = await nftContract.tokenURI(tokenId);
//             console.log(`🖼 NFT Metadata URI:`, metadataURI);

//             // 🔹 從 URI 下載 JSON Metadata
//             const response = await fetch(metadataURI);
//             const metadata = await response.json();
//             setNftMetadata(metadata);
//         } catch (error) {
//             console.error("❌ 獲取 NFT Metadata 失敗:", error);
//         }
//     };

//     const calculateTWDValue = (maticAmount: string) => {
//         if (!maticTwd || isNaN(Number(maticAmount))) {
//             setCalculatedTWD(null);
//             return;
//         }
//         setCalculatedTWD(Number(maticAmount) * maticTwd);
//     };

//     return (
//         <div className="container">
//             <h1>🛒 拍賣詳情</h1>
//             {auction ? (
//                 <>
//                     <p><strong>📌 拍賣地址:</strong> {id}</p>
//                     <p><strong>👤 最高出價者:</strong> {auction.highestBidder || "無"}</p>
//                     <p><strong>⌛ 拍賣結束時間:</strong> {new Date(auction.endTime * 1000).toLocaleString()}</p>
//                     <p><strong>💰 目前最高出價:</strong> {auction.highestBid} POL</p>

//                     {maticUsd !== null && usdTwd !== null && maticTwd !== null ? (
//                         <>
//                             <p><strong>💲 POL/USD:</strong> {maticUsd.toFixed(4)} USD</p>
//                             <p><strong>💲 USD/TWD:</strong> {usdTwd.toFixed(2)} TWD</p>
//                             <p><strong>💲 POL/TWD:</strong> {maticTwd.toFixed(2)} TWD</p>
//                         </>
//                     ) : (
//                         <p>⏳ 加載匯率中...</p>
//                     )}

//                     {nftMetadata && (
//                         <div>
//                             <h3>🖼 NFT 詳情</h3>
//                             <img src={nftMetadata.image} alt={nftMetadata.name} width="200" />
//                             <p><strong>名稱:</strong> {nftMetadata.name}</p>
//                             <p><strong>描述:</strong> {nftMetadata.description}</p>
//                         </div>
//                     )}

//                     <h3>💰 競標</h3>
//                     <input
//                         type="number"
//                         placeholder="輸入你的競標金額 (POL)"
//                         value={bidAmount}
//                         onChange={(e) => {
//                             setBidAmount(e.target.value);
//                             calculateTWDValue(e.target.value);
//                         }}
//                     />
//                     <p><strong>🔹 估算金額:</strong> {calculatedTWD?.toFixed(2)} TWD</p>
                    
//                 </>
//             ) : (
//                 <p>⏳ 加載中...</p>
//             )}
//         </div>
//     );
// }

// import { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import { ethers } from "ethers";

// const AUCTION_ABI = [
//     "function getAuctionDetails() external view returns (uint256, uint256, address, bool, bool, uint256)",
//     "function tokenId() external view returns (uint256)",
//     "function submitBid() external payable" // ✅ 確保 ABI 包含競標函數
// ];

// const NFT_ABI = [
//     "function tokenURI(uint256 tokenId) external view returns (string)"
// ];

// const NFT_CONTRACT_ADDRESS = "0xeE21F63Fc85C62C62488f2Cfa61a6051950c699E"; // 🔹 你的 NFT 合約地址

// export default function AuctionPage() {
//     const router = useRouter();
//     const { id } = router.query; // 拍賣合約地址
//     const [auction, setAuction] = useState<any>(null);
//     const [bidAmount, setBidAmount] = useState("");
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [nftMetadata, setNftMetadata] = useState<any>(null);
//     const [tokenId, setTokenId] = useState<number | null>(null); // 🔹 NFT Token ID

//     useEffect(() => {
//         if (id) {
//             fetchAuctionDetails();
//             fetchTokenId();
//         }
//     }, [id]);

//     const fetchAuctionDetails = async () => {
//         try {
//             if (!window.ethereum) throw new Error("請連接 MetaMask");
//             const provider = new ethers.BrowserProvider(window.ethereum);
//             const contract = new ethers.Contract(id as string, AUCTION_ABI, provider);

//             const [startTime, endTime, highestBidder, ended, nftDeposited, highestBid] = await contract.getAuctionDetails();
//             setAuction({
//                 startTime: Number(startTime),
//                 endTime: Number(endTime),
//                 highestBidder,
//                 ended,
//                 nftDeposited,
//                 highestBid: ethers.formatEther(highestBid)
//             });
//         } catch (error) {
//             console.error("❌ 獲取拍賣詳情失敗:", error);
//         }
//     };

//     const fetchTokenId = async () => {
//         try {
//             if (!window.ethereum) throw new Error("請連接 MetaMask");
//             const provider = new ethers.BrowserProvider(window.ethereum);
//             const auctionContract = new ethers.Contract(id as string, AUCTION_ABI, provider);

//             const fetchedTokenId = await auctionContract.tokenId();
//             setTokenId(Number(fetchedTokenId));
//             fetchNFTMetadata(Number(fetchedTokenId));
//         } catch (error) {
//             console.error("❌ 無法獲取 tokenId:", error);
//         }
//     };

//     const fetchNFTMetadata = async (tokenId: number) => {
//         try {
//             if (!window.ethereum) throw new Error("請連接 MetaMask");
//             const provider = new ethers.BrowserProvider(window.ethereum);
//             const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);

//             const metadataURI = await nftContract.tokenURI(tokenId);
//             const response = await fetch(metadataURI);
//             const metadata = await response.json();
//             setNftMetadata(metadata);
//         } catch (error) {
//             console.error("❌ 獲取 NFT Metadata 失敗:", error);
//         }
//     };

//     const handleBid = async () => {
//         if (!bidAmount || isNaN(Number(bidAmount)) || Number(bidAmount) <= 0) {
//             alert("⚠️ 請輸入有效的競標金額！");
//             return;
//         }

//         setIsSubmitting(true);

//         try {
//             if (!window.ethereum) throw new Error("請連接 MetaMask");
//             const provider = new ethers.BrowserProvider(window.ethereum);
//             const signer = await provider.getSigner();
//             const contract = new ethers.Contract(id as string, AUCTION_ABI, signer);

//             const tx = await contract.submitBid({ value: ethers.parseEther(bidAmount) });
//             await tx.wait();

//             alert("🎉 競標成功！");
//             fetchAuctionDetails();
//         } catch (error) {
//             console.error("❌ 競標失敗:", error);
//             alert("❌ 競標失敗，請稍後重試！");
//         }

//         setIsSubmitting(false);
//     };

//     return (
//         <div className="container">
//             <h1>🛒 拍賣詳情</h1>
//             {auction ? (
//                 <>
//                     <p><strong>📌 拍賣地址:</strong> {id}</p>
//                     <p><strong>👤 最高出價者:</strong> {auction.highestBidder || "無"}</p>
//                     <p><strong>⌛ 拍賣結束時間:</strong> {new Date(auction.endTime * 1000).toLocaleString()}</p>
//                     <p><strong>💰 目前最高出價:</strong> {auction.highestBid} POL</p>

//                     {nftMetadata && (
//                         <div>
//                             <h3>🖼 NFT 詳情</h3>
//                             <img src={nftMetadata.image} alt={nftMetadata.name} width="200" />
//                             <p><strong>名稱:</strong> {nftMetadata.name}</p>
//                             <p><strong>描述:</strong> {nftMetadata.description}</p>
//                         </div>
//                     )}

//                     <h3>💰 競標</h3>
//                     <input
//                         type="number"
//                         placeholder="輸入你的競標金額 (POL)"
//                         value={bidAmount}
//                         onChange={(e) => setBidAmount(e.target.value)}
//                     />
                    
//                     {/* ✅ 顯示競標按鈕，並確保拍賣尚未結束 */}
//                     {!auction.ended ? (
//                         <button onClick={handleBid} disabled={isSubmitting}>
//                             {isSubmitting ? "⏳ 競標中..." : "⚡ 提交競標"}
//                         </button>
//                     ) : (
//                         <p>⚠️ 拍賣已結束</p>
//                     )}
//                 </>
//             ) : (
//                 <p>⏳ 加載中...</p>
//             )}
//         </div>
//     );
// }
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
