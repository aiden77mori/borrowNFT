// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./interfaces/IBEP20.sol";
import "./libs/SafeMath.sol";

contract DifinesToken is IBEP20 {
    using SafeMath for uint256;
    string _name;
    string _symbol;
    uint8 _decimals;
    uint256 _totalSupply;

    address _operator;
    address public constant BURN_ADDRESS =
        0x000000000000000000000000000000000000dEaD;

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    event Burn(address indexed from, uint256 value);

    mapping(address => uint256) balances;
    mapping(address => mapping(address => uint256)) allowed;

    constructor(
        uint256 initialSupply,
        string memory tokenName,
        uint8 tokenDecimal,
        string memory tokenSymbol
    ) {
        _name = tokenName;
        _symbol = tokenSymbol;
        _decimals = tokenDecimal;
        _totalSupply = initialSupply * (10**tokenDecimal);
        balances[msg.sender] = _totalSupply;
        _operator = msg.sender;
        emit OwnershipTransferred(address(0), _operator);
    }

    function transfer(address _to, uint256 _value)
        public
        override
        returns (bool success)
    {
        require(balances[msg.sender] >= _value, "Not enough tokens");

        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);

        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address delegate, uint256 _value)
        public
        override
        returns (bool success)
    {
        allowed[msg.sender][delegate] = _value;

        emit Approval(msg.sender, delegate, _value);
        return true;
    }

    function transferFrom(
        address owner,
        address buyer,
        uint256 _value
    ) public override returns (bool success) {
        require(_value <= balances[owner]);
        require(_value <= allowed[owner][msg.sender]);

        balances[owner] = balances[owner].sub(_value);
        balances[buyer] = balances[buyer].add(_value);

        allowed[owner][msg.sender] = allowed[owner][msg.sender].sub(_value);

        emit Transfer(owner, buyer, _value);
        return true;
    }

    function getOwner() public view override returns (address) {
        return _operator;
    }

    function name() public view override returns (string memory) {
        return _name;
    }

    function symbol() public view override returns (string memory) {
        return _symbol;
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return balances[account];
    }

    function allowance(address owner, address delegate)
        public
        view
        override
        returns (uint256)
    {
        return allowed[owner][delegate];
    }

    function burn(uint256 _value) public override onlyOperator {
        transfer(BURN_ADDRESS, _value);
        _totalSupply = _totalSupply.sub(_value);

        emit Burn(msg.sender, _value);
    }

    modifier onlyOperator() {
        require(
            _operator == msg.sender || msg.sender == getOwner(),
            "Difines: caller is not the operator"
        );
        _;
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public onlyOperator {
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     */
    function _transferOwnership(address newOwner)
        internal
        returns (bool success)
    {
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );

        emit OwnershipTransferred(_operator, newOwner);
        _operator = newOwner;

        return true;
    }
}
