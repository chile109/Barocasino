// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";

contract Baccarat is UUPSUpgradeable, Ownable {
    enum GameOutcome {
        BankerWin,
        PlayerWin,
        Tie
    }
    enum PairOutcome {
        PlayerPair,
        BankerPair,
        NoPair,
        BothPair
    }
    struct Player {
        uint256 points;
    }

    mapping(address => Player) public players;
    mapping(address => uint256) public usedPassCount;
    mapping(address => bool) public claimed;
    uint256 public constant INITIAL_POINTS = 10000;
    uint256 public constant BANKER_WIN_RATE = 195;
    uint256 public constant PLAYER_WIN_RATE = 200;
    uint256 public constant TIE_RATE = 800;
    uint256 public constant PLAYER_PAIR_RATE = 1100;
    uint256 public constant BANKER_PAIR_RATE = 1100;
    uint256 public constant RATE_DECIMALS = 100;
    
    uint256 public PassTokenId; //default 0
    address public passNftAddress;
    address public rewardTokenAddress;
    uint256 public rewardTokenAmount;
    uint256 public endTime;
    address[] public topThreePlayers;
    
    bool public initialized;
    IERC1155 passNft;
    IERC20 rewardToken;
    event BetResult(
        address indexed bettor,
        uint256 playerWin,
        uint256 backerWin,
        uint256 Tie,
        uint256 playerPair,
        uint256 bankerPair,
        uint256 winAmount,
        uint256 pairOutcome,
        uint256 gameOutcome
    );

    constructor() Ownable(msg.sender) {}
    function _authorizeUpgrade(address newImplementation) internal virtual override onlyOwner {}

    function initialize(address _passNftAddress, address _rewardTokenAddress, uint256 _rewardTokenAmount, uint256 _endDay) external {
        require(!initialized, "Contract has been initialized.");
        initialized = true;
        topThreePlayers = new address[](3);
        passNftAddress = _passNftAddress;
        rewardTokenAddress = _rewardTokenAddress;
        rewardTokenAmount = _rewardTokenAmount;
        endTime = block.timestamp + _endDay * 1 days;
        passNft = IERC1155(passNftAddress);
        rewardToken = IERC20(rewardTokenAddress);
        rewardToken.transferFrom(msg.sender, address(this), rewardTokenAmount);
        _transferOwnership(tx.origin);
    }

    // 初始化玩家積分
    function addPlayer() external {
        require(players[msg.sender].points == 0, "Player still in game.");

        passNft.safeTransferFrom(msg.sender, address(this), PassTokenId, 1, "");
        usedPassCount[msg.sender]++;
        players[msg.sender] = Player(INITIAL_POINTS);
    }

    function claimReward() external {
        require(block.timestamp >= endTime, "The game is not over yet.");
        require(!claimed[msg.sender], "Reward has been claimed.");
        uint256 rank = rankInTopThree(msg.sender);
        require(rank < 3, "Player is not in the top three.");
        claimed[msg.sender] = true;
        rewardToken.transfer(msg.sender, reward(rank));
    }

    function claimNft() external {
        require(block.timestamp >= endTime, "The game is not over yet.");
        require(usedPassCount[msg.sender] > 0, "Player has not used the pass.");

        passNft.safeTransferFrom(address(this), msg.sender, PassTokenId, usedPassCount[msg.sender], "");
    }

    // 下注並根據遊戲結果更新積分
    function bet(
        uint256 playerWin,
        uint256 backerWin,
        uint256 Tie,
        uint256 playerPair,
        uint256 bankerPair
    )
        external
        returns (
            uint256 winAmount,
            uint256 pairResult,
            uint256 gameResult
        )
    {
        uint256 totalBet = playerWin +
            backerWin +
            Tie +
            playerPair +
            bankerPair;
        require(
            totalBet > 0 && totalBet <= players[msg.sender].points,
            "Invalid bet amount."
        );
        require(block.timestamp < endTime, "The game is over.");
        players[msg.sender].points -= totalBet; // 扣除下注積分

        GameOutcome betOutcome = getBetResult();
        PairOutcome pairOutcome = getPairResult();
        pairResult = uint256(pairOutcome);
        gameResult = uint256(betOutcome);
        winAmount = calculateWinAmount(
            playerWin,
            backerWin,
            Tie,
            playerPair,
            bankerPair,
            betOutcome,
            pairOutcome
        ); // 根據結果計算贏得的積分
        emit BetResult(
            msg.sender,
            playerWin,
            backerWin,
            Tie,
            playerPair,
            bankerPair,
            winAmount,
            pairResult,
            gameResult
        );
        players[msg.sender].points += winAmount; // 更新玩家積分
        updateTopThree(msg.sender);
    }

    // 生成遊戲結果
    function getBetResult() public view returns (GameOutcome) {
        uint256 random = unsafeRandom("bet") % 10000;
        if (random < 4586) {
            return GameOutcome.BankerWin;
        } else if (random >= 4586 && random < (4586 + 4462)) {
            return GameOutcome.PlayerWin;
        } else {
            return GameOutcome.Tie;
        }
    }

    function getPairResult() public view returns (PairOutcome) {
        uint256 bankResult = unsafeRandom("bankerPair") % 10000;
        uint256 playerResult = unsafeRandom("playerPair") % 10000;
        if (bankResult < 747 && playerResult < 747) {
            return PairOutcome.BothPair;
        } else if (bankResult < 747) {
            return PairOutcome.BankerPair;
        } else if (playerResult < 747) {
            return PairOutcome.PlayerPair;
        } else {
            return PairOutcome.NoPair;
        }
    }

    // 根據下注結果計算贏得的積分
    function calculateWinAmount(
        uint256 playerWin,
        uint256 backerWin,
        uint256 Tie,
        uint256 playerPair,
        uint256 bankerPair,
        GameOutcome gameOutcome,
        PairOutcome pairOutcome
    ) private pure returns (uint256) {
        uint256 winAmount = 0;
        if (gameOutcome == GameOutcome.PlayerWin) {
            winAmount += (playerWin * PLAYER_WIN_RATE) / RATE_DECIMALS;
        } else if (gameOutcome == GameOutcome.BankerWin) {
            winAmount += (backerWin * BANKER_WIN_RATE) / RATE_DECIMALS;
        } else if (gameOutcome == GameOutcome.Tie) {
            winAmount += (Tie * TIE_RATE) / RATE_DECIMALS;
        }

        if (pairOutcome == PairOutcome.BothPair) {
            winAmount +=
                ((playerPair * PLAYER_PAIR_RATE) / RATE_DECIMALS) +
                ((bankerPair * BANKER_PAIR_RATE) / RATE_DECIMALS);
        } else if (pairOutcome == PairOutcome.BankerPair) {
            winAmount += (bankerPair * BANKER_PAIR_RATE) / RATE_DECIMALS;
        } else if (pairOutcome == PairOutcome.PlayerPair) {
            winAmount += (playerPair * PLAYER_PAIR_RATE) / RATE_DECIMALS;
        }
        return winAmount;
    }

    // 更新前三名玩家
    function updateTopThree(address player) private {
        uint insertIndex = 3; // 默认不在前三之内

        for (uint i = 0; i < topThreePlayers.length; i++) {
            if (
                topThreePlayers[i] == address(0) ||
                players[player].points > players[topThreePlayers[i]].points
            ) {
                insertIndex = i;
                break; // 找到插入位置后退出循环
            }
        }

        if (insertIndex < 3) {
            for (uint j = topThreePlayers.length - 1; j > insertIndex; j--) {
                topThreePlayers[j] = topThreePlayers[j - 1];
            }
            topThreePlayers[insertIndex] = player;
        }
    }

    function rankInTopThree(address player) public view returns (uint256) {
        for (uint i = 0; i < topThreePlayers.length; i++) {
            if (topThreePlayers[i] == player) {
                return i;
            }
        }
        return 3; // not in top three
    }

    function unsafeRandom(string memory seed) private view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(block.timestamp, block.prevrandao, seed)
                )
            );
    }

    function reward(uint256 rank) public view returns (uint256) {
        if (rank == 0) {
            return rewardTokenAmount / 10 * 5;
        } else if (rank == 1) {
            return rewardTokenAmount / 10 * 3;
        } else if (rank == 2) {
            return rewardTokenAmount / 10 * 2;
        } else {
            return 0;
        }
    }

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    )
        external
        returns(bytes4)
    {
        return this.onERC1155Received.selector;
    }
    
    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    )
        external
        returns(bytes4)
    {
        return this.onERC1155BatchReceived.selector;
    }
    
    function supportsInterface(bytes4 interfaceId) public view virtual returns (bool) {
        return interfaceId == type(IERC1155Receiver).interfaceId;
    }
}
