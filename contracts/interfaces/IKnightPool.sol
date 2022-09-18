// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IKnightPool {
    function getPoolBalance() external view returns (uint256);

    function depositeToPool(uint256 amount) external returns (bool success);

    function transferFromPoolForWithdraw(uint256 amount)
        external
        returns (uint256);

    event WithdrawFromPool(uint256 amount);
    event DepositeToPool(uint256 amount);
}
