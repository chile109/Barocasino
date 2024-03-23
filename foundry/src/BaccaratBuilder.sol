// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;
import { BaccaratProxy } from "./BaccaratProxy.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BaccaratBuilder {
  address public immutable BACCARAT_IMPLEMENT_ADDRESS;

  constructor(address _baccaratImplementAddress) {
    BACCARAT_IMPLEMENT_ADDRESS = _baccaratImplementAddress;
  }

  function build(address _pass_nft_address, address _reward_token_address, uint256 _reward_amount, uint256 _period_day) external returns (address) {
    IERC20 token = IERC20(_reward_token_address);
    BaccaratProxy baccarat = new BaccaratProxy(BACCARAT_IMPLEMENT_ADDRESS, "");
    token.transferFrom(msg.sender, address(this), _reward_amount);
    token.approve(address(baccarat), _reward_amount);
    (bool success,) = address(baccarat).call(abi.encodeWithSignature("initialize(address,address,uint256,uint256)", _pass_nft_address, _reward_token_address, _reward_amount, _period_day));
    require(success, "BaccaratBuilder: failed to initialize Baccarat");

    return address(baccarat);
  }
}