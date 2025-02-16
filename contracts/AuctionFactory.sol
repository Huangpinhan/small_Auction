// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./BlindAuction.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract AuctionFactory {
    address public factoryOwner;

    event AuctionCreated(
        address indexed auctionAddress,
        address indexed owner,
        address indexed nftContract,
        uint256 tokenId,
        uint256 endTime
    );

    struct AuctionInfo {
        address auctionAddress;
        address owner;
        address nftContract;
        uint256 tokenId;
        uint256 endTime;
    }

    mapping(uint256 => AuctionInfo) public auctions;
    uint256 public auctionCount;

    /**
     * @dev **建構子** - 設定工廠擁有者
     */
    constructor() {
        factoryOwner = msg.sender; // 部署者為合約擁有者
    }

    /**
     * @dev 創建新的拍賣
     * @param endTime 拍賣結束時間（UNIX 時間戳）
     * @param nftContract NFT 合約地址
     * @param tokenId NFT Token ID
     */
    function createAuction(
        uint256 endTime,
        address nftContract,
        uint256 tokenId
    ) external returns (address) {
        require(endTime > block.timestamp, "Auction end time must be in the future");

        BlindAuction newAuction = new BlindAuction(msg.sender, endTime, nftContract, tokenId);

        auctions[auctionCount] = AuctionInfo({
            auctionAddress: address(newAuction),
            owner: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            endTime: endTime
        });

        auctionCount++;
        emit AuctionCreated(address(newAuction), msg.sender, nftContract, tokenId, endTime);

        return address(newAuction);
    }

    /**
     * @dev 獲取所有拍賣
     * @return 拍賣陣列
     */
    function getAllAuctions() external view returns (AuctionInfo[] memory) {
        AuctionInfo[] memory auctionList = new AuctionInfo[](auctionCount);
        for (uint256 i = 0; i < auctionCount; i++) {
            auctionList[i] = auctions[i];
        }
        return auctionList;
    }
}
