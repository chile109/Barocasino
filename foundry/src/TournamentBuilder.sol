// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;
import { TournamentProxy } from "./TournamentProxy.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TournamentBuilder is Ownable {
  address public baccaratImplementAddress;

  constructor(address _baccaratImplementAddress) Ownable(msg.sender) {
    baccaratImplementAddress = _baccaratImplementAddress;
  }

  function setBaccaratImplementAddress(address _baccaratImplementAddress) external onlyOwner {
    baccaratImplementAddress = _baccaratImplementAddress;
  }

  function build(address _pass_nft_address, address _reward_token_address, uint256 _reward_amount, uint256 _period_day) external returns (address) {
    IERC20 token = IERC20(_reward_token_address);
    TournamentProxy baccarat = new TournamentProxy(baccaratImplementAddress, "");
    token.transferFrom(msg.sender, address(this), _reward_amount);
    token.approve(address(baccarat), _reward_amount);
    (bool success,) = address(baccarat).call(abi.encodeWithSignature("initialize(address,address,uint256,uint256)", _pass_nft_address, _reward_token_address, _reward_amount, _period_day));
    require(success, "TournamentBuilder: failed to initialize Baccarat");

    return address(baccarat);
  }
}