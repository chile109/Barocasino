// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CityFishingBowl is ERC721, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("CityFishing", "CFG") {
    }

    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    //設定NFT meta data回傳網址
    string baseURI_;
    function _baseURI() internal override view virtual returns (string memory) {
        return baseURI_;
    }

    function setbaseURI(string memory _str) external {
        baseURI_ = _str;
    }
}