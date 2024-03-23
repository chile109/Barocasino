pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
contract BaccaratCoin is ERC20, Ownable {
    constructor() ERC20(_name, _symbol) {
        _name = "Baccarat Coin";
        _symbol = "BAC";
    }

    function mint(uint amount) onlyOwner external {
        _mint(msg.sender, amount);
    }
}