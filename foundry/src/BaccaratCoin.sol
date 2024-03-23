// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BaccaratCoin is ERC20, Ownable {
    constructor() ERC20("Baccarat Coin", "BAC") Ownable(msg.sender) {
        // Ownable's constructor does not require arguments and is called automatically.
    }

    function mint(uint amount) external onlyOwner {
        _mint(msg.sender, amount);
    }
}
