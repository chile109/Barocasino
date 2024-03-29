// SPDX-License-Identifier: MIT
pragma solidity ^0.5.11;

interface IERC20 {
    function transfer(address, uint256) external returns (bool);
    function transferFrom(address, address, uint256) external returns (bool);
}

contract BaroCasinoTournament {
    event Launch(
        uint256 id,
        address indexed creator,
        uint256 goal,
        uint32 startAt,
        uint32 endAt
    );
    event Cancel(uint256 id);
    event Pledge(uint256 indexed id, address indexed caller, uint256 amount);
    event Unpledge(uint256 indexed id, address indexed caller, uint256 amount);
    event Claim(uint256 id);
    event Refund(uint256 id, address indexed caller, uint256 amount);

    struct Tournament {
        // Creator of tournament
        address creator;
        // Amount of seats to start tournament
        uint256 goal;
        // Total amount pledged
        uint256 pledged;
        // Timestamp of start of tournament
        uint32 startAt;
        // Timestamp of end of tournament
        uint32 endAt;
        // True if goal was reached and creator has claimed the tokens.
        bool claimed;
    }

    IERC20 public immutable token;
    // Total count of campaigns created.
    // It is also used to generate id for new campaigns.
    uint256 public count;
    // Mapping from id to Tournament
    mapping(uint256 => Tournament) public campaigns;
    // Mapping from tournament id => pledger => amount pledged
    mapping(uint256 => mapping(address => uint256)) public pledgedAmount;

    // set chip token
    constructor(address _token) {
        token = IERC20(_token);
    }

    function launch(uint256 _goal, uint32 _startAt, uint32 _endAt) external {
        require(_startAt >= block.timestamp, "start at < now");
        require(_endAt >= _startAt, "end at < start at");
        require(_endAt <= block.timestamp + 90 days, "end at > max duration");

        count += 1;
        campaigns[count] = Tournament({
            creator: msg.sender,
            goal: _goal,
            pledged: 0,
            startAt: _startAt,
            endAt: _endAt,
            claimed: false
        });

        emit Launch(count, msg.sender, _goal, _startAt, _endAt);
    }

    function cancel(uint256 _id) external {
        Tournament memory tournament = campaigns[_id];
        require(tournament.creator == msg.sender, "not creator");
        require(block.timestamp < tournament.startAt, "started");

        delete campaigns[_id];
        emit Cancel(_id);
    }

    function pledge(uint256 _id, uint256 _amount) external {
        Tournament storage tournament = campaigns[_id];
        require(block.timestamp >= tournament.startAt, "not started");
        require(block.timestamp <= tournament.endAt, "ended");

        tournament.pledged += _amount;
        pledgedAmount[_id][msg.sender] += _amount;
        token.transferFrom(msg.sender, address(this), _amount);

        emit Pledge(_id, msg.sender, _amount);
    }

    function unpledge(uint256 _id, uint256 _amount) external {
        Tournament storage tournament = campaigns[_id];
        require(block.timestamp <= tournament.endAt, "ended");

        tournament.pledged -= _amount;
        pledgedAmount[_id][msg.sender] -= _amount;
        token.transfer(msg.sender, _amount);

        emit Unpledge(_id, msg.sender, _amount);
    }

    function claim(uint256 _id) external {
        Tournament storage tournament = campaigns[_id];
        require(tournament.creator == msg.sender, "not creator");
        require(block.timestamp > tournament.endAt, "not ended");
        require(tournament.pledged >= tournament.goal, "pledged < goal");
        require(!tournament.claimed, "claimed");

        tournament.claimed = true;
        token.transfer(tournament.creator, tournament.pledged);

        emit Claim(_id);
    }

    function refund(uint256 _id) external {
        Tournament memory tournament = campaigns[_id];
        require(block.timestamp > tournament.endAt, "not ended");
        require(tournament.pledged < tournament.goal, "pledged >= goal");

        uint256 bal = pledgedAmount[_id][msg.sender];
        pledgedAmount[_id][msg.sender] = 0;
        token.transfer(msg.sender, bal);

        emit Refund(_id, msg.sender, bal);
    }
}
