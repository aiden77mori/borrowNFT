// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IWhiteKnight {
    struct Player {
        uint256 playerId;
        uint32 level;
        uint256 lastDepositeTime;
        uint256 lastWithdrawTime;
        string name;
        uint256 amount;
        uint256 depositeCount;
        uint256 withdrawCount;
        uint256 totalDepositeAmount;
        uint256 totalWithdrawAmount;
    }

    function getContractAddress() external view returns (address);

    function viewPlayerInfo(address from) external view returns (Player memory);

    function viewRegisteredPlayersNumber() external view returns (uint256);

    function createProfile(string memory username)
        external
        returns (Player memory);

    function depositeToContract(uint256 amount) external returns (bool success);

    function withdrawFromContract(uint256 amount)
        external
        returns (bool success);

    event CreateProfile(address indexed from, string username);
    event DepositToContract(address from, uint256 amount);
    event WithdrawFromContract(address to, uint256 amount);
    event NotifyDepositeRewards(address to);
    event NotifyWithdrawRewards(address to);
}
