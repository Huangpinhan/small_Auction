// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    event Minted(address indexed owner, uint256 tokenId, string tokenURI);

    constructor() ERC721("MyNFTCollection", "MNFT") Ownable(msg.sender) {}

    /// @notice 鑄造 NFT
    /// @param tokenURI NFT 的元數據 URI (存於 IPFS / Pinata)
    function mintNFT(string memory tokenURI) external returns (uint256) {
        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        emit Minted(msg.sender, newTokenId, tokenURI);
        return newTokenId;
    }

    /// ✅ **提供 NFT 授權給拍賣合約**
    function approveAuction(address auctionContract, uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Only NFT owner can approve");
        approve(auctionContract, tokenId);  // ✅ 使用 `approve()` 來授權，而不是 `_approve()`
    }
}
