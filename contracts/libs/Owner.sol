//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

contract Owner {
    address public operator;

    constructor() {
        operator = msg.sender;
    }

    function getOperator() public view returns (address) {
        return operator;
    }

    function transferOwnership(address newOperator)
        public
        onlyOperator
        returns (bool success)
    {
        require(
            newOperator != address(0) || operator != newOperator,
            "Ownable: new operator is the zero address, new operator can't be same with current operator"
        );
        operator = newOperator;

        return true;
    }

    modifier onlyOperator() {
        require(msg.sender == operator);
        _;
    }
}
