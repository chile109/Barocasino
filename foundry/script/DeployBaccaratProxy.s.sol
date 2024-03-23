// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Script, console2} from "forge-std/Script.sol";
import { Baccarat } from "../src/Baccarat.sol";
import { BaccaratBuilder } from "../src/BaccaratBuilder.sol";
import {BaccaratProxy} from "../src/BaccaratProxy.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DeployBaccaratProxy is Script {

    address constant NFT_ADDRESS = 0xbA0413137062e3A00C0161BB1f8fec3181A308Cd;
    address constant REWARD_TOKEN_ADDRESS = 0x8EEdCC5CFE405b893dF033927F43D179CC9A2Ca7;
    address constant BUILDER_ADDRESS = 0x6b3e3F09ba553A1DF0AA70fF781dfad184810625;
    address constant OP_NFT_ADDRESS = 0x36eE7E01Db601e2454430F86480734fa1Aaca172;
    address constant OP_REWARD_TOKEN_ADDRESS = 0x89d24cBa791823e0e7AF273DEc347fe9a3FD88a3;
    address constant OP_BUILDER_ADDRESS = 0xc9c39f808d183f8cEB6FC0e322c5ED9b5fB3c2C2;
    uint256 reward = 1000;
    uint256 gamePeriodDay = 30;
    uint256 privateKey = vm.envUint("PRIVATE_KEY");

    function run() public {
        vm.startBroadcast(privateKey);
        BaccaratBuilder builder = BaccaratBuilder(BUILDER_ADDRESS);
        IERC20 token = IERC20(REWARD_TOKEN_ADDRESS);
        token.approve(BUILDER_ADDRESS, reward);
        address baccaratProxy = builder.build(NFT_ADDRESS, REWARD_TOKEN_ADDRESS, reward, gamePeriodDay);

        console2.log("BaccaratProxy deployed success Address: ", address(baccaratProxy));
        vm.stopBroadcast();
    }

    function runOp() public {
        vm.startBroadcast(privateKey);
        BaccaratBuilder builder = BaccaratBuilder(OP_BUILDER_ADDRESS);
        IERC20 token = IERC20(OP_REWARD_TOKEN_ADDRESS);
        token.approve(OP_BUILDER_ADDRESS, reward);
        address baccaratProxy = builder.build(OP_NFT_ADDRESS, OP_REWARD_TOKEN_ADDRESS, reward, gamePeriodDay);

        console2.log("BaccaratProxy deployed success Address: ", address(baccaratProxy));
        vm.stopBroadcast();
    }
}


