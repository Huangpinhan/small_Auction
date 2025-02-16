// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract BlindAuction is Ownable {
    IERC721 public nftContract;
    uint256 public tokenId;
    address public seller;
    bool public nftLocked; // ✅ NFT 是否已經轉移到合約

    struct Auction {
        uint256 startTime;
        uint256 endTime;
        uint256 highestBid; // ✅ 最高出價（明文）
        address highestBidder;
        bool ended;
    }

    Auction public auction;

    event NewBid(address indexed bidder, uint256 bidAmount);
    event AuctionEnded(address winner, uint256 winningBid);
    event NFTTransferred(address indexed to, uint256 tokenId);
    event NFTDeposited(address indexed from, uint256 tokenId);
    event AuctionCancelled(address indexed seller);

    constructor(
        address _owner,
        uint256 _auctionEndTime,
        address _nftContract,
        uint256 _tokenId
    ) Ownable(_owner) {
        auction.startTime = block.timestamp; 
        auction.endTime = _auctionEndTime;
        auction.highestBid = 0; // ✅ 初始最高出價為 0
        auction.ended = false;
        seller = _owner;
        nftContract = IERC721(_nftContract);
        tokenId = _tokenId;
        nftLocked = false; // ✅ 初始狀態，NFT 尚未轉移
    }

    function transferNFTToAuction() external onlyOwner {
    require(!nftLocked, "NFT already deposited");
    require(nftContract.ownerOf(tokenId) == msg.sender, "You do not own this NFT");
    require(nftContract.getApproved(tokenId) == address(this) || nftContract.isApprovedForAll(msg.sender, address(this)), "NFT is not approved");

    // ✅ 轉移 NFT 到拍賣合約
    nftContract.transferFrom(msg.sender, address(this), tokenId);

    // 🔍 **調試: 確保 NFT 轉移成功**
    require(nftContract.ownerOf(tokenId) == address(this), "NFT transfer failed");

    nftLocked = true;
    emit NFTDeposited(msg.sender, tokenId);

    // 🔍 **調試: 確保 nftLocked 設置成功**
    require(nftLocked, "nftLocked flag was not set");
}
function submitBid() external payable {
    require(!auction.ended, "Auction has ended"); // 拍賣是否已結束
    //require(nftLocked, "NFT has not been deposited"); // NFT 是否已經存入合約
    require(msg.value > 0, "Bid must be greater than zero"); // ✅ 防止無效競標
    require(msg.value > auction.highestBid, "Bid must be higher than current highest bid"); // ✅ 必須高於當前最高出價

    // ✅ **退還前一位最高出價者**
    if (auction.highestBidder != address(0)) {
        (bool success, ) = payable(auction.highestBidder).call{value: auction.highestBid}("");
        require(success, "Failed to refund previous highest bidder");
    }

    // ✅ **更新最高出價**
    auction.highestBid = msg.value;
    auction.highestBidder = msg.sender;

    emit NewBid(msg.sender, msg.value);
}

    

    function endAuction() external{
    require(block.timestamp >= auction.endTime, "Auction is still ongoing");
    require(!auction.ended, "Auction already ended");
    //require(nftLocked, "NFT has not been deposited");

    auction.ended = true;

    if (auction.highestBidder != address(0)) {
        //require(nftContract.ownerOf(tokenId) == address(this), "Contract does not own the NFT");

        // ✅ 轉移 NFT 給最高出價者
        nftContract.transferFrom(address(this), auction.highestBidder, tokenId);

        // ✅ 確保 ETH 轉帳成功
        (bool success, ) = payable(seller).call{value: auction.highestBid}("");
        require(success, "ETH transfer failed");

        emit NFTTransferred(auction.highestBidder, tokenId);
        emit AuctionEnded(auction.highestBidder, auction.highestBid);
    } else {
        // ✅ 沒人競標，退回 NFT
        //require(nftContract.ownerOf(tokenId) == address(this), "Contract does not own the NFT");

        nftContract.transferFrom(address(this), seller, tokenId);
        emit NFTTransferred(seller, tokenId);
        emit AuctionEnded(address(0), 0);
    }
}



    /// @notice 讓賣家取消拍賣（如果拍賣還沒開始）
    function cancelAuction() external onlyOwner {
        require(!auction.ended, "Auction already ended");
        require(!nftLocked, "NFT is already deposited");

        auction.ended = true;
        emit AuctionCancelled(msg.sender);
    }

    /// @notice **讓前端獲取拍賣詳情**
    function getAuctionDetails() external view returns (
        uint256 startTime,
        uint256 endTime,
        address highestBidder,
        bool ended,
        bool nftDeposited,
        uint256 highestBid
    ) {
        return (
            auction.startTime,
            auction.endTime,
            auction.highestBidder,
            auction.ended,
            nftLocked,
            auction.highestBid
        );
    }
}
