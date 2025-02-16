import { useRouter } from "next/router";

interface Auction {
    auctionAddress: string;
    owner: string;
    nftContract: string;
    tokenId: number;
    endTime: number;
}

export default function AuctionCard({ auction }: { auction: Auction }) {
    const router = useRouter();

    return (
        <div className="auction-item">
            <p><strong>📌 拍賣地址:</strong> {auction.auctionAddress}</p>
            <p><strong>👤 賣家:</strong> {auction.owner}</p>
            <p><strong>🏷️ NFT 合約:</strong> {auction.nftContract}</p>
            <p><strong>🔹 Token ID:</strong> {auction.tokenId}</p>
            <p><strong>⌛ 結束時間:</strong> {new Date(auction.endTime * 1000).toLocaleString()}</p>
            <button onClick={() => router.push(`/auctions/${auction.auctionAddress}`)}>
                🔍 查看詳情
            </button>
        </div>
    );
}
