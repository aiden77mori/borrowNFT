//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract DifinesNFT is ERC721, ERC721URIStorage, ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    Counters.Counter private _tokenIds;
    Counters.Counter private _sellItemIds;
    Counters.Counter private _swapItemIds;

    address _operator;
    string _contractName;
    string _contractSymbol;
    IERC20 public busdToken;

    uint256[4] private mintPrice;
    uint256[2] private specialMintPrice;

    uint256 public totalSupply;

    uint256 private royalty; // totalRoyalty (e.g: 10 busd * 100 / 1000 = 1 busd)
    uint256 private devRoyalty; // royalty for dev in totalRoyalty (e.g: 1 busd * 200 / 1000 = 0.2 busd)
    uint256 private usersRoyalty; // royalty for users in totalRoyalty (e.g: 1 busd * 800 / 1000 = 0.8 busd)

    address private devWallet;

    struct MarketItem {
        uint256 tokenId;
        address creator;
        address owner;
        uint256 nftType;
    }

    struct ItemForSale {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool isSold;
    }

    struct ItemForSwap {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool isSwapped;
    }

    mapping(uint256 => MarketItem) public idToMarketItem;
    mapping(uint256 => bool) public activeItems;
    mapping(uint256 => ItemForSale) public itemsForSale;
    mapping(uint256 => ItemForSwap) public itemsForSwap;

    event ListItemForSale(uint256 tokenId, uint256 price);
    event RemoveItemFromSale(uint256 tokenId);
    event ItemSold(uint256 tokenId, address recipient, uint256 price);

    event ListItemForSwap(uint256 tokenId, uint256 price);
    event RemoveItemFromSwap(uint256 tokenId);
    event ItemSwaped(uint256 id1, uint256 id2);

    constructor(address busdAddress, address devWalletAddress)
        ERC721("DifinesNFTMarketplace", "DNM")
    {
        _operator = msg.sender;
        _contractName = "DifinesNFTMarketplace";
        _contractSymbol = "DNM";
        mintPrice = [300, 200, 100, 50];
        specialMintPrice = [3000, 1000];
        totalSupply = 20000;
        royalty = 100;
        devRoyalty = 300;
        usersRoyalty = 700;
        busdToken = IERC20(busdAddress); // busd(test or main address)
        devWallet = devWalletAddress;
    }

    function mintNFT(
        address _to,
        string memory _tokenUri,
        uint256 nftType
    ) public returns (uint256) {
        // pay busd to admin
        uint256 mPrice = 0;
        if (nftType == 250) {
            mPrice = specialMintPrice[0];
        } else if (nftType == 200) {
            mPrice = specialMintPrice[1];
        } else if (nftType == 70) {
            mPrice = mintPrice[0];
        } else if (nftType == 50) {
            mPrice = mintPrice[1];
        } else if (nftType == 20) {
            mPrice = mintPrice[2];
        } else {
            mPrice = mintPrice[3];
        }

        require(
            busdToken.balanceOf(msg.sender) >= mPrice,
            "User does not have enough money to mint item"
        );

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(_to, newItemId);
        _setTokenURI(newItemId, _tokenUri);
        idToMarketItem[newItemId] = MarketItem(newItemId, _to, _to, nftType);

        SafeERC20.safeTransferFrom(
            busdToken,
            msg.sender,
            devWallet,
            mPrice * 1e18
        );

        return newItemId;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function tokenBurn(uint256 tokenId)
        public
        virtual
        onlyOwner
        IsNonActiveItem(tokenId)
    {
        _burn(tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
        delete idToMarketItem[tokenId];
        totalSupply = totalSupply - 1;
    }

    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _tokenIds.current();
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            uint256 currentId = i + 1;
            MarketItem storage currentItem = idToMarketItem[currentId];
            if (currentItem.tokenId == currentId) {
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }

    function fetchMyNFT() public view returns (MarketItem[] memory) {
        uint256 itemCount = _tokenIds.current();
        uint256 myNFTCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                myNFTCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](myNFTCount);
        for (uint256 i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
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

    function getTotalSupply() public view returns (uint256) {
        return totalSupply;
    }

    function getRoyalty() public view returns (uint256) {
        return royalty;
    }

    function getDevRoyalty() public view returns (uint256) {
        return devRoyalty;
    }

    function getUsersRoyalty() public view returns (uint256) {
        return usersRoyalty;
    }

    function getSellItemAmounts() public view returns (uint256) {
        return _sellItemIds.current();
    }

    function getSwapItemAmounts() public view returns (uint256) {
        return _swapItemIds.current();
    }

    /**
     ***************************************
     ************* Buy, Sell Part **********
     ***************************************
     */

    function listItemForSale(uint256 tokenId, uint256 price)
        public
        OnlyItemOwner(tokenId)
        IsNonActiveItem(tokenId)
        returns (uint256)
    {
        _sellItemIds.increment();
        itemsForSale[tokenId] = ItemForSale(tokenId, msg.sender, price, false);
        activeItems[tokenId] = true;

        assert(itemsForSale[tokenId].tokenId == tokenId);
        emit ListItemForSale(tokenId, price);

        return tokenId;
    }

    function removeItemFromSale(uint256 tokenId)
        public
        OnlyItemOwner(tokenId)
        returns (uint256)
    {
        require(activeItems[tokenId], "Item is not up for sale");

        delete itemsForSale[tokenId];
        activeItems[tokenId] = false;

        _sellItemIds.decrement();

        emit RemoveItemFromSale(tokenId);

        return tokenId;
    }

    function buyItem(uint256 tokenId)
        public
        ItemForSaleExists(tokenId)
        IsNotSold(tokenId)
        HasTransferApproval(tokenId)
    {
        require(
            msg.sender != itemsForSale[tokenId].seller,
            "User is not seller"
        );
        require(
            busdToken.balanceOf(msg.sender) >= itemsForSale[tokenId].price,
            "User does not have enough money to buy item"
        );

        // transfer nft to buyer
        safeTransferFrom(itemsForSale[tokenId].seller, msg.sender, tokenId);

        // calculate royalty...
        uint256 royaltyAmount = itemsForSale[tokenId].price.mul(royalty).div(
            1000
        );
        uint256 recipAmount = itemsForSale[tokenId].price.sub(royaltyAmount);

        // transfer busd to this address(before transfer should call approve function in the frontend)
        SafeERC20.safeTransferFrom(
            busdToken,
            msg.sender,
            address(this),
            itemsForSale[tokenId].price * 1e18
        );
        // transfer recipAmount of busd to the seller
        SafeERC20.safeTransfer(
            busdToken,
            itemsForSale[tokenId].seller,
            recipAmount * 1e18
        );
        // tranfer royaltyAmount of busd to the nft owners and admin or dev wallet
        transferRoyalty(royaltyAmount);

        // itemsForSale[id].isSold = true;
        delete itemsForSale[tokenId];
        activeItems[tokenId] = false;
        _sellItemIds.decrement();

        // update marketItem
        idToMarketItem[tokenId].owner = msg.sender;

        emit ItemSold(tokenId, msg.sender, itemsForSale[tokenId].price);
    }

    function transferRoyalty(uint256 amount) private {
        uint256 usersAmount = amount.mul(usersRoyalty).div(1000);
        uint256 devAmount = amount.mul(devRoyalty).div(1000);
        // transfer royaltyAmount of busd to admin (or dev wallet)
        SafeERC20.safeTransfer(busdToken, devWallet, devAmount * 1e18);
        // transfer royaltyAmount of busd to nft owners
        MarketItem[] memory marketItem = fetchMarketItems();
        uint256 nftTypeTotalAmount = 0;

        for (uint256 i = 0; i < marketItem.length; i++) {
            nftTypeTotalAmount = nftTypeTotalAmount + marketItem[i].nftType;
        }
        for (uint256 i = 0; i < marketItem.length; i++) {
            uint256 userRoyalty = usersAmount.mul(marketItem[i].nftType).div(
                nftTypeTotalAmount
            );
            SafeERC20.safeTransfer(
                busdToken,
                marketItem[i].owner,
                userRoyalty * 1e18
            );
        }
    }

    /**
     ***************************************
     ************* Swap Part ***************
     ***************************************
     */

    function listItemForSwap(uint256 tokenId, uint256 price)
        public
        OnlyItemOwner(tokenId)
        IsNonActiveItem(tokenId)
        returns (uint256)
    {
        _swapItemIds.increment();
        itemsForSwap[tokenId] = ItemForSwap(tokenId, msg.sender, price, false);
        activeItems[tokenId] = true;

        assert(itemsForSwap[tokenId].tokenId == tokenId);
        emit ListItemForSwap(tokenId, price);

        return tokenId;
    }

    function removeItemFromSwap(uint256 tokenId)
        public
        OnlyItemOwner(tokenId)
        returns (uint256)
    {
        require(activeItems[tokenId], "Item is not up for swap");

        delete itemsForSwap[tokenId];
        activeItems[tokenId] = false;

        _swapItemIds.decrement();

        emit RemoveItemFromSwap(tokenId);

        return tokenId;
    }

    function swapItem(
        uint256 tokenId1,
        string memory tokenUri1,
        uint256 tokenId2,
        string memory tokenUri2
    )
        public
        ItemForSwapExists(tokenId1)
        OnlyItemOwner(tokenId2)
        IsNonActiveItem(tokenId2)
    {
        require(
            busdToken.balanceOf(msg.sender) >= itemsForSwap[tokenId1].price,
            "User does not have enough money to buy item"
        );
        // tokenId1 => target token, tokenUri1 => changed token uri with tokenUri2
        // tokenId2 => msg.sender 's token (only item owner can proceed this), tokenUri2 => changed token uri with tokenUri1
        _setTokenURI(tokenId1, tokenUri1);
        _setTokenURI(tokenId2, tokenUri2);

        // calculate royalty...
        uint256 royaltyAmount = itemsForSwap[tokenId1].price.mul(royalty).div(
            1000
        );
        uint256 recipAmount = itemsForSwap[tokenId1].price.sub(royaltyAmount);

        // transfer busd to this address(before transfer should call approve function in the frontend)
        SafeERC20.safeTransferFrom(
            busdToken,
            msg.sender,
            address(this),
            itemsForSwap[tokenId1].price * 1e18
        );
        // transfer recipAmount of busd to the seller
        SafeERC20.safeTransfer(
            busdToken,
            itemsForSwap[tokenId1].seller,
            recipAmount * 1e18
        );
        // tranfer royaltyAmount of busd to the nft owners and admin or dev wallet
        transferRoyalty(royaltyAmount);

        emit ItemSwaped(tokenId1, tokenId2);
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

    modifier ItemForSaleExists(uint256 tokenId) {
        require(
            itemsForSale[tokenId].tokenId == tokenId,
            "Could not find item on the sale list"
        );
        _;
    }

    modifier ItemForSwapExists(uint256 tokenId) {
        require(
            itemsForSwap[tokenId].tokenId == tokenId,
            "Could not find item on the swap list"
        );
        _;
    }

    modifier IsNotSold(uint256 tokenId) {
        require(!itemsForSale[tokenId].isSold, "Item is already sold");
        _;
    }

    modifier IsNonActiveItem(uint256 tokenId) {
        require(!activeItems[tokenId], "Should not active");
        _;
    }

    modifier HasTransferApproval(uint256 tokenId) {
        require(
            getApproved(tokenId) == address(this),
            "Market is not approved"
        );
        _;
    }

    /**
     **************************************
     ************* only owner *************
     **************************************
     */

    function safeMint(
        address _to,
        string memory _tokenUri,
        uint256 nftType
    ) public onlyOwner {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _safeMint(_to, newItemId);
        _setTokenURI(newItemId, _tokenUri);
        idToMarketItem[newItemId] = MarketItem(newItemId, _to, _to, nftType);
    }

    function setMintPrice(uint256 _price, uint256 index) public onlyOwner {
        mintPrice[index] = _price;
    }

    function setSpecialMintPrice(uint256 _price, uint256 index)
        public
        onlyOwner
    {
        specialMintPrice[index] = _price;
    }

    function setTotalSupply(uint256 amount) public onlyOwner {
        totalSupply = amount;
    }

    function setRoyalty(uint256 _price) public onlyOwner {
        royalty = _price;
    }

    function setDevRoyalty(uint256 _price) public onlyOwner {
        devRoyalty = _price;
    }

    function setUsersRoyalty(uint256 _price) public onlyOwner {
        usersRoyalty = _price;
    }
}
