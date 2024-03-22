// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Baccarat {
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
    uint256 public constant INITIAL_POINTS = 10000;
    struct Player {
        uint256 points;
    }

    mapping(address => Player) public players;
    address[] public topThreePlayers = new address[](3);
    uint256 public bankerWinRate = 200;
    uint256 public playerWinRate = 195;
    uint256 public tieRate = 800;
    uint256 public playerPairRate = 1100;
    uint256 public bankerPairRate = 1100;
    uint256 public rateDecimals = 100;

    event BetResult(
        address indexed bettor,
        uint256 playerWin,
        uint256 backerWin,
        uint256 Tie,
        uint256 playerPair,
        uint256 bankerPair,
        uint256 winAmount,
        PairOutcome pairOutcome,
        GameOutcome gameOutcome
    );

    // 初始化玩家積分
    function addPlayer() external {
        require(players[msg.sender].points == 0, "Player already exists.");
        players[msg.sender] = Player(INITIAL_POINTS);
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
            PairOutcome pairOutcome,
            GameOutcome gameOutcome
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
        players[msg.sender].points -= totalBet; // 扣除下注積分

        GameOutcome betOutcome = betResult();
        PairOutcome pairOutcome = pairResult();
        uint256 winAmount = calculateWinAmount(
            playerWin,
            backerWin,
            Tie,
            playerPair,
            bankerPair,
            betOutcome,
            pairOutcome
        ); // 根據結果計算贏得的積分

        players[msg.sender].points += winAmount; // 更新玩家積分
        updateTopThree(msg.sender);
    }

    // 生成遊戲結果
    function betResult() public view returns (GameOutcome) {
        uint256 random = unsafeRandom("bet") % 10000;
        if (random < 4586) {
            return GameOutcome.BankerWin;
        } else if (random >= 4586 && random < (4586 + 4462)) {
            return GameOutcome.PlayerWin;
        } else {
            return GameOutcome.Tie;
        }
    }

    function pairResult() public view returns (PairOutcome) {
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
    ) private view returns (uint256) {
        uint256 winAmount = 0;
        if (gameOutcome == GameOutcome.PlayerWin) {
            winAmount += (playerWin * playerWinRate) / rateDecimals;
        } else if (gameOutcome == GameOutcome.BankerWin) {
            winAmount += (backerWin * bankerWinRate) / rateDecimals;
        } else if (gameOutcome == GameOutcome.Tie) {
            winAmount += (Tie * tieRate) / rateDecimals;
        }

        if (pairOutcome == PairOutcome.BothPair) {
            winAmount +=
                ((playerPair * playerPairRate) / rateDecimals) +
                ((bankerPair * bankerPairRate) / rateDecimals);
        } else if (pairOutcome == PairOutcome.BankerPair) {
            winAmount += (bankerPair * bankerPairRate) / rateDecimals;
        } else if (pairOutcome == PairOutcome.PlayerPair) {
            winAmount += (playerPair * playerPairRate) / rateDecimals;
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

    function unsafeRandom(string memory seed) private view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(block.timestamp, block.prevrandao, seed)
                )
            );
    }
}
