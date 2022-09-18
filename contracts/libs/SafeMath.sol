// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

// a library for performing overflow-safe math, courtesy of DappHub (https://github.com/dapphub/ds-math)

library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256 z) {
        // require((z = x + y) >= x, "ds-math-add-overflow");
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256 z) {
        // require((z = x - y) <= x, "ds-math-sub-underflow");
        assert(b <= a);
        return a - b;
    }

    function mul(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y == 0 || (z = x * y) / y == x, "ds-math-mul-overflow");
    }

    function div(uint256 x, uint256 y) internal pure returns (uint256 z) {
        return x / y;
    }

    function mod(uint256 x, uint256 y) internal pure returns (uint256 z) {
        return x % y;
    }
}
