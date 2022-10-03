// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "hardhat/console.sol";

contract DifinesNFT is ERC721, ERC721URIStorage, ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
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

    uint256 public maxSupply = 20000;

    uint256 private royalty; // totalRoyalty (e.g: 10 busd * 100 / 1000 = 1 busd)
    uint256 private devRoyalty; // royalty for dev in totalRoyalty (e.g: 1 busd * 200 / 1000 = 0.2 busd)
    uint256 private usersRoyalty; // royalty for users in totalRoyalty (e.g: 1 busd * 800 / 1000 = 0.8 busd)

    address private devWallet;

    struct MarketItem {
        uint256 tokenId;
        address creator;
        address owner;
        uint256 nftType;
        string tokenUri;
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

    event MintNFT(uint256 tokenId, uint256 price);

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
        royalty = 100;
        devRoyalty = 100;
        usersRoyalty = 900;
        busdToken = IERC20(busdAddress); // busd(test or main address)
        devWallet = devWalletAddress;
    }

    function mintNFT(string memory tokenUri, uint256 nftType)
        public
        returns (uint256)
    {
        /**
      ************************
      ****** NFT Types *******
      ************************
      special hero 10
      special sword 7
      special shield 7
      special jewel 7

      common hero 4
      common sword 3
      common shield 2
      common jewel 1
       */

        uint256 mPrice = 0;
        if (nftType == 10) {
            mPrice = specialMintPrice[0];
        } else if (nftType == 7) {
            mPrice = specialMintPrice[1];
        } else if (nftType == 4) {
            mPrice = mintPrice[0];
        } else if (nftType == 3) {
            mPrice = mintPrice[1];
        } else if (nftType == 2) {
            mPrice = mintPrice[2];
        } else {
            mPrice = mintPrice[3];
        }

        require(
            busdToken.balanceOf(msg.sender) >= mPrice,
            "User does not have enough money to mint item"
        );

        _tokenIds.increment();

        require(_tokenIds.current() <= maxSupply, "Can't mint over maxSupply");

        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenUri);
        idToMarketItem[newItemId] = MarketItem(
            newItemId,
            msg.sender,
            msg.sender,
            nftType,
            tokenUri
        );

        // pay busd to admin (call approve busd in the frontend)
        busdToken.transferFrom(msg.sender, devWallet, mPrice * 1e18);

        emit MintNFT(newItemId, mPrice * 1e18);

        return newItemId;
    }

    function safeTransfer(address to, uint256 tokenId) public {
        require(tx.origin == msg.sender, "sender should be same with origin");
        safeTransferFrom(msg.sender, to, tokenId);
        // update marketItem
        idToMarketItem[tokenId].owner = to;
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
    }

    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _tokenIds.current();
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            uint256 currentId = i + 1;
            MarketItem storage currentItem = idToMarketItem[currentId];
            if (currentItem.creator != address(0)) {
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }

    function fetchSellItems() public view returns (ItemForSale[] memory) {
        uint256 sellItemCount = _sellItemIds.current();
        uint256 currentIndex = 0;
        MarketItem[] memory marketItems = fetchMarketItems();

        ItemForSale[] memory saleItems = new ItemForSale[](sellItemCount);
        for (uint256 i = 0; i < marketItems.length; i++) {
            uint256 curTokenId = marketItems[i].tokenId;
            ItemForSale storage currentItem = itemsForSale[curTokenId];
            if (currentItem.seller != address(0)) {
                saleItems[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return saleItems;
    }

    function fetchSwapItems() public view returns (ItemForSwap[] memory) {
        uint256 swapItemCount = _swapItemIds.current();
        uint256 currentIndex = 0;
        MarketItem[] memory marketItems = fetchMarketItems();

        ItemForSwap[] memory swapItems = new ItemForSwap[](swapItemCount);
        for (uint256 i = 0; i < marketItems.length; i++) {
            uint256 curTokenId = marketItems[i].tokenId;
            ItemForSwap storage currentItem = itemsForSwap[curTokenId];
            if (currentItem.seller != address(0)) {
                swapItems[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return swapItems;
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
            if (idToMarketItem[i + 1].owner == from) {
                myNFTCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](myNFTCount);
        for (uint256 i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == from) {
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

    function getMarketItemAmounts() public view returns (uint256) {
        return _tokenIds.current();
    }

    function getSwapItemAmounts() public view returns (uint256) {
        return _swapItemIds.current();
    }

    function getDevWalletAddress() public view returns (address) {
        return devWallet;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
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
        itemsForSale[tokenId] = ItemForSale(
            tokenId,
            msg.sender,
            price * 1e18,
            false
        );
        activeItems[tokenId] = true;

        assert(itemsForSale[tokenId].tokenId == tokenId);
        emit ListItemForSale(tokenId, price * 1e18);

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
    {
        require(
            msg.sender != itemsForSale[tokenId].seller,
            "User is not seller"
        );
        require(
            busdToken.balanceOf(msg.sender) >= itemsForSale[tokenId].price,
            "User does not have enough money to buy item"
        );

        // should call erc721 approve function before transferFrom nft
        _approve(msg.sender, tokenId);
        // transfer nft to buyer
        safeTransferFrom(itemsForSale[tokenId].seller, msg.sender, tokenId);

        // update marketItem
        idToMarketItem[tokenId].owner = msg.sender;

        // calculate royalty...
        uint256 royaltyAmount = itemsForSale[tokenId].price.mul(royalty).div(
            1000
        );
        uint256 recipAmount = itemsForSale[tokenId].price.sub(royaltyAmount);

        // transfer busd to this address(before transfer should call approve function in the frontend)
        busdToken.transferFrom(
            msg.sender,
            address(this),
            itemsForSale[tokenId].price
        );
        // transfer recipAmount of busd to the seller
        busdToken.transfer(itemsForSale[tokenId].seller, recipAmount);
        // tranfer royaltyAmount of busd to the nft owners and admin or dev wallet
        transferRoyalty(royaltyAmount);

        // itemsForSale[id].isSold = true;
        _sellItemIds.decrement();
        delete itemsForSale[tokenId];
        activeItems[tokenId] = false;

        emit ItemSold(tokenId, msg.sender, itemsForSale[tokenId].price);
    }

    function transferRoyalty(uint256 amount) private {
        uint256 usersAmount = amount.mul(usersRoyalty).div(1000);
        uint256 devAmount = amount.mul(devRoyalty).div(1000);
        // transfer royaltyAmount of busd to admin (or dev wallet)
        busdToken.transfer(devWallet, devAmount);

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
            busdToken.transfer(marketItem[i].owner, userRoyalty);
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
        itemsForSwap[tokenId] = ItemForSwap(
            tokenId,
            msg.sender,
            price * 1e18,
            false
        );
        activeItems[tokenId] = true;

        assert(itemsForSwap[tokenId].tokenId == tokenId);
        emit ListItemForSwap(tokenId, price * 1e18);

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
        busdToken.transferFrom(
            msg.sender,
            address(this),
            itemsForSwap[tokenId1].price
        );
        // transfer recipAmount of busd to the seller
        busdToken.transfer(itemsForSwap[tokenId1].seller, recipAmount);
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

    /**
     **************************************
     ************* only owner *************
     **************************************
     */

    function safeMint(string memory tokenUri, uint256 nftType)
        public
        onlyOwner
    {
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

        _tokenIds.increment();

        require(_tokenIds.current() <= maxSupply, "Can't mint over maxSupply");

        uint256 newItemId = _tokenIds.current();
        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenUri);
        idToMarketItem[newItemId] = MarketItem(
            newItemId,
            msg.sender,
            msg.sender,
            nftType,
            tokenUri
        );

        emit MintNFT(newItemId, mPrice * 1e18);
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

    function setMaxSupply(uint256 amount) public onlyOwner {
        maxSupply = amount;
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

    function transferOwner(address newOwner) public onlyOwner {
        transferOwnership(newOwner);
        _operator = newOwner;
    }

    function setDevWalletAddress(address newWallet) public onlyOwner {
        devWallet = newWallet;
    }
}
