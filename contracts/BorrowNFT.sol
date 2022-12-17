// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "hardhat/console.sol";

contract DifinesNFT is ERC721URIStorage, ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    Counters.Counter private _tokenIds;

    address _operator;
    string _contractName;
    string _contractSymbol;
    IERC20 public testToken;
    uint256 public maxSupply = 20000;
    address private devWallet;

    struct MarketItem {
        uint256 tokenId;
        address creator;
        address borrower;
        string tokenUri;
        uint256 tokenAmount;
        bool borrowed;
    }

    mapping(uint256 => MarketItem) public idToMarketItem;
    mapping(string => bool) nftExists;

    event MintNFT(uint256 tokenId, uint256 amount);

    constructor(address tokenAddr) ERC721("BorrowNFT", "BNFT") {
        _operator = msg.sender;
        _contractName = "BorrowNFT";
        _contractSymbol = "BNFT";
        testToken = IERC20(tokenAddr); // test token that will be used in this defi
    }

    function mintNFT(string memory tokenUri, uint256 amount)
        external
        returns (uint256)
    {
        require(_tokenIds.current() <= maxSupply, "Can't mint over maxSupply");
        require(amount > 0, "amount should > 0");
        require(!nftExists[tokenUri], "same tokenUri(nft) can't mint again");

        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenUri);

        MarketItem storage mItem = idToMarketItem[newItemId];
        mItem.tokenId = newItemId;
        mItem.creator = msg.sender;
        mItem.borrower = address(0x0);
        mItem.tokenUri = tokenUri;
        mItem.tokenAmount = amount;
        mItem.borrowed = false;

        nftExists[tokenUri] = true;
        _tokenIds.increment();

        testToken.transferFrom(msg.sender, address(this), amount); // pay test token to this contract (call approve test token in the frontend)

        emit MintNFT(newItemId, amount);
        return newItemId;
    }

    function borrowNFT(uint256 nftId)
        external
        isNotBorrowed(nftId)
        returns (uint256)
    {
        require(
            testToken.balanceOf(address(this)) >=
                idToMarketItem[nftId].tokenAmount,
            "pool don't have enough token balance to lending"
        );

        MarketItem storage nftItem = idToMarketItem[nftId];
        nftItem.borrower = msg.sender;
        nftItem.borrowed = true;

        testToken.transfer(msg.sender, nftItem.tokenAmount);

        return nftId;
    }

    function rePayNFT(uint256 nftId)
        external
        isBorrowed(nftId)
        isBorrower(nftId)
        returns (uint256)
    {
        require(
            testToken.balanceOf(msg.sender) >=
                idToMarketItem[nftId].tokenAmount,
            "rePayer don't have enough balance to repay in thier wallet"
        );

        MarketItem storage nftItem = idToMarketItem[nftId];
        nftItem.borrower = address(0x0);
        nftItem.borrowed = false;

        // should approve before call this function in the frontend
        testToken.transferFrom(msg.sender, address(this), nftItem.tokenAmount);

        return nftId;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function tokenBurn(uint256 tokenId) public virtual onlyOwner {
        _burn(tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721URIStorage) {
        super._burn(tokenId);
    }

    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _tokenIds.current();
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            MarketItem storage currentItem = idToMarketItem[i];
            if (currentItem.creator != address(0x0)) {
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }

    function fetchMyNFT(address from)
        public
        view
        returns (MarketItem[] memory)
    {
        uint256 itemCount = _tokenIds.current();
        uint256 myNFTCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < itemCount; i++) {
            if (idToMarketItem[i].borrower == from) {
                myNFTCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](myNFTCount);
        for (uint256 i = 0; i < itemCount; i++) {
            if (idToMarketItem[i].borrower == from) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }

    function getOwner() public view returns (address) {
        return _operator;
    }

    function getContractName() public view returns (string memory) {
        return _contractName;
    }

    function getContractSymbol() public view returns (string memory) {
        return _contractSymbol;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }

    /**
     ***************************************
     ************* Modifier ****************
     ***************************************
     */

    modifier OnlyItemOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Sender does not own the item");
        _;
    }

    modifier isNotBorrowed(uint256 nftId) {
        require(
            !idToMarketItem[nftId].borrowed,
            "Other already borrowed this nft"
        );
        _;
    }

    modifier isBorrowed(uint256 nftId) {
        require(idToMarketItem[nftId].borrowed, "This nft is not borrowed yet");
        _;
    }

    modifier isBorrower(uint256 nftId) {
        require(
            idToMarketItem[nftId].borrower == msg.sender,
            "Only borrower of this nft can repay"
        );
        _;
    }

    /**
     **************************************
     ************* only owner *************
     **************************************
     */

    function setMaxSupply(uint256 amount) public onlyOwner {
        maxSupply = amount;
    }

    function transferOwner(address newOwner) public onlyOwner {
        transferOwnership(newOwner);
        _operator = newOwner;
    }
}
