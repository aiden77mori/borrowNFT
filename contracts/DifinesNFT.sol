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
    Counters.Counter private _sellItemAmounts;
    Counters.Counter private _swapItemAmounts;

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
        address owner;
        uint256 nftType;
    }

    struct ItemForSale {
        uint256 id;
        uint256 tokenId;
        address seller;
        uint256 price;
        bool isSold;
    }

    struct ItemForSwap {
        uint256 id;
        uint256 tokenId;
        address seller;
        uint256 price;
        bool isSold;
    }

    mapping(uint256 => MarketItem) public idToMarketItem;
    mapping(uint256 => bool) public activeItems;
    mapping(uint256 => ItemForSale) public itemsForSale;
    mapping(uint256 => ItemForSwap) public itemsForSwap;
    // ItemForSale[] public itemsForSale;

    event ListItemForSale(uint256 id, uint256 tokenId, uint256 price);
    event RemoveItemFromSale(uint256 id, uint256 tokenId);
    event ItemSold(uint256 id, address recipient, uint256 price);

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
        devRoyalty = 200;
        usersRoyalty = 800;
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
        idToMarketItem[newItemId] = MarketItem(newItemId, _to, nftType);

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
            items[currentIndex] = currentItem;
            currentIndex += 1;
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
      return _sellItemAmounts.current();
    }

    function getSwapItemAmounts() public view returns (uint256) {
      return _swapItemAmounts.current();
    }

    /**
     ***************************************
     ************* Buy, Sell Part **********
     ***************************************
     */

    function listItemForSale(uint256 tokenId, uint256 price)
        public
        OnlyItemOwner(tokenId)
        returns (uint256)
    {
        require(!activeItems[tokenId], "Item is already up for sale");

        _sellItemAmounts.increment();
        uint256 lastItemId = itemsForSale[_sellItemAmounts.current()].id;
        uint256 newItemId = lastItemId + 1;
        itemsForSale[newItemId] = ItemForSale(
            newItemId,
            tokenId,
            msg.sender,
            price,
            false
        );
        activeItems[tokenId] = true;

        assert(itemsForSale[newItemId].id == newItemId);
        emit ListItemForSale(newItemId, tokenId, price);

        return newItemId;
    }

    function removeItemFromSale(uint256 tokenId)
        public
        OnlyItemOwner(tokenId)
        returns (uint256)
    {
        require(activeItems[tokenId], "Item is not up for sale");

        uint256 itemId = 0;
        for (uint256 i = 0; i < _sellItemAmounts.current(); i++) {
            if (itemsForSale[i].tokenId == tokenId) {
                itemId = i;
            }
        }

        delete itemsForSale[itemId];
        activeItems[tokenId] = false;

        _sellItemAmounts.decrement();

        emit RemoveItemFromSale(itemId, tokenId);

        return itemId;
    }

    function buyItem(uint256 id)
        public
        ItemForSaleExists(id)
        IsNotSold(id)
        HasTransferApproval(itemsForSale[id].tokenId)
    {
        require(msg.sender != itemsForSale[id].seller, "User is not seller");
        require(
            busdToken.balanceOf(msg.sender) >= itemsForSale[id].price,
            "User does not have enough money to buy item"
        );

        uint256 tokenId = itemsForSale[id].tokenId;

        // transfer nft to buyer
        safeTransferFrom(itemsForSale[id].seller, msg.sender, tokenId);

        // calculate royalty...
        uint256 royaltyAmount = itemsForSale[id].price.mul(royalty).div(1000);
        uint256 recipAmount = itemsForSale[id].price.sub(royaltyAmount);

        // transfer busd to this address(before transfer should call approve function in the frontend)
        SafeERC20.safeTransferFrom(
            busdToken,
            msg.sender,
            address(this),
            itemsForSale[id].price * 1e18
        );
        // transfer recipAmount of busd to the seller
        SafeERC20.safeTransfer(
            busdToken,
            itemsForSale[id].seller,
            recipAmount * 1e18
        );
        // tranfer royaltyAmount of busd to the nft owners and admin or dev wallet
        transferRoyalty(royaltyAmount);

        // itemsForSale[id].isSold = true;
        delete itemsForSale[id];
        activeItems[tokenId] = false;
        _sellItemAmounts.decrement();

        // update marketItem
        idToMarketItem[tokenId].owner = msg.sender;

        emit ItemSold(id, msg.sender, itemsForSale[id].price);
    }

    function transferRoyalty(uint256 amount) private {
        uint256 usersAmount = amount.mul(usersRoyalty).sub(1000);
        uint256 devAmount = amount.mul(devRoyalty).sub(1000);
        // transfer royaltyAmount of busd to admin (or dev wallet)
        SafeERC20.safeTransfer(busdToken, devWallet, devAmount * 1e18);
        // transfer royaltyAmount of busd to nft owners
        MarketItem[] memory marketItem = fetchMarketItems();
        uint256 nftTypeTotalAmount = 0;

        for (uint256 i = 0; i < marketItem.length; i++) {
            nftTypeTotalAmount = nftTypeTotalAmount + marketItem[i].nftType;
        }
        for (uint256 i = 0; i < marketItem.length; i++) {
            uint256 userRoyalty = usersAmount.mul(marketItem[i].nftType).sub(
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

    function listItemForSwap(uint256 tokenId, uint256 price) public OnlyItemOwner(tokenId) returns (uint256) {

    }

    function removeItemFromSwap(uint256 tokenId) public OnlyItemOwner(tokenId) returns (uint256) {

    }

    function swapItem(uint256 tokenId1, string memory tokenUri1, uint256 tokenId2, string memory tokenUri2)
        public
        ItemForSwapExists(tokenId1)
        OnlyItemOwner(tokenId2)
        IsNonActiveItem(tokenId2)
    {
        // tokenId1 => target token
        // tokenId2 => msg.sender 's token (only item owner can proceed this)
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

    modifier ItemForSaleExists(uint256 id) {
        require(
            itemsForSale[id].id == id,
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

    modifier IsNotSold(uint256 id) {
        require(!itemsForSale[id].isSold, "Item is already sold");
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

    function safeMint(address _to, string memory _tokenUri, uint256 nftType) public onlyOwner {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _safeMint(_to, newItemId);
        _setTokenURI(newItemId, _tokenUri);
        idToMarketItem[newItemId] = MarketItem(newItemId, _to, nftType);
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
