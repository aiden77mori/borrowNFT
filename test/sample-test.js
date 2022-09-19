const { expect } = require("chai");
const { ethers } = require("hardhat");

let difinesNft;
let busdToken;
let owner;
let user;
let anotherUser;
let devWallet = "0x7a315ec417bddf49c122770b26a1453e25b2576b";

describe("Difines NFT Marketplace", function () {
  it("Deploy NFT and BUSD Contract", async function () {
    [owner, user, anotherUser] = await ethers.getSigners();
    const DifinesNFT = await ethers.getContractFactory("DifinesNFT");
    // const BUSDToken = await ethers.getContractFactory("BusdToken");
    const BUSDToken = await ethers.getContractFactory("DifinesToken");
    busdToken = await BUSDToken.deploy(50000, "cBUSD", 18, "cBUSD");
    await busdToken.deployed();

    console.log("------------------------");
    console.log("----- BUSD Address -----");
    console.log("------------------------");
    console.log(busdToken.address);
    console.log("\n");

    difinesNft = await DifinesNFT.deploy(
      busdToken.address,
      "0x7a315ec417bddf49c122770b26a1453e25b2576b"
    );
    await difinesNft.deployed();

    console.log("-----------------------------------");
    console.log("----- NFT Marketplace Address -----");
    console.log("-----------------------------------");
    console.log(difinesNft.address);
    console.log("\n");
  });

  it("Should Mint NFT", async function () {
    // transfer 5000 busd to user from owner
    await busdToken.transfer(
      user.address,
      ethers.utils.parseUnits(Number(5000).toString(), 18)
    );
    // transfer 5000 busd to anotherUser from owner
    await busdToken.transfer(
      anotherUser.address,
      ethers.utils.parseUnits(Number(5000).toString(), 18)
    );

    console.log("------------------------------------------------");
    console.log("------ Owner, User, AnotherUser's balance ------");
    console.log("------------------------------------------------");
    console.log(
      "Owner = ",
      ethers.utils.formatEther(await busdToken.balanceOf(owner.address))
    );
    console.log(
      "User = ",
      ethers.utils.formatEther(await busdToken.balanceOf(user.address))
    );
    console.log(
      "AnotherUser = ",
      ethers.utils.formatEther(await busdToken.balanceOf(anotherUser.address))
    );
    console.log("\n");

    // user's nft mint
    // before mint, should call erc20 approve function
    await busdToken
      .connect(user)
      .approve(
        difinesNft.address,
        ethers.utils.parseUnits(Number(3000).toString(), 18)
      );
    let txUser = await difinesNft
      .connect(user)
      .mintNFT("https://difines.io/user/tokenUri", 250);
    await txUser.wait();
    console.log("User mint hash result = ", txUser.hash);
    console.log("\n");

    // anotherUser's nft mint
    // before mint, should call erc20 approve function
    await busdToken
      .connect(anotherUser)
      .approve(
        difinesNft.address,
        ethers.utils.parseUnits(Number(1000).toString(), 18)
      );
    let txAnotherUser = await difinesNft
      .connect(anotherUser)
      .mintNFT("https://difines.io/anotherUser/tokenUri", 200);
    await txAnotherUser.wait();
    console.log("AnotherUser mint hash result = ", txAnotherUser.hash);
    console.log("\n");

    // owner's nft mint
    let txOwner = await difinesNft.safeMint(
      "https://difines.io/owner/tokenUri",
      70
    );
    await txOwner.wait();
    console.log("Owner mint hash result = ", txOwner.hash);
    console.log("\n");

    console.log("----------------------------");
    console.log("------ User`s address ------");
    console.log("----------------------------");
    console.log(await user.address);
    console.log("\n");

    console.log("----------------------------");
    console.log("------ User`s balance ------");
    console.log("----------------------------");
    console.log(
      ethers.utils.formatEther(await busdToken.balanceOf(user.address))
    );
    console.log("\n");

    console.log("-----------------------------------");
    console.log("------ AnotherUser`s address ------");
    console.log("-----------------------------------");
    console.log(await anotherUser.address);
    console.log("\n");

    console.log("-----------------------------------");
    console.log("------ AnotherUser`s balance ------");
    console.log("-----------------------------------");
    console.log(
      ethers.utils.formatEther(await busdToken.balanceOf(anotherUser.address))
    );
    console.log("\n");

    console.log("-----------------------------");
    console.log("------ Owner`s address ------");
    console.log("-----------------------------");
    console.log(await owner.address);
    console.log("\n");

    console.log("-----------------------------");
    console.log("------ Owner`s balance ------");
    console.log("-----------------------------");
    console.log(
      ethers.utils.formatEther(await busdToken.balanceOf(owner.address))
    );
    console.log("\n");

    console.log("---------------------------------");
    console.log("------ DevWallet`s balance ------");
    console.log("---------------------------------");
    console.log(ethers.utils.formatEther(await busdToken.balanceOf(devWallet)));
  });

  it("Should fetch NFT", async function () {
    let list = await difinesNft.fetchMarketItems();
    console.log("-----------------------------");
    console.log("------ NFT Market Items -----");
    console.log("-----------------------------");
    console.log(list);
    console.log("\n");

    let userNFTList = await difinesNft.connect(user).fetchMyNFT();
    console.log("---------------------------");
    console.log("------ User NFT Items -----");
    console.log("---------------------------");
    console.log(userNFTList);
    console.log("\n");

    let anotherUserNFTList = await difinesNft.connect(anotherUser).fetchMyNFT();
    console.log("----------------------------------");
    console.log("------ AnotherUser NFT Items -----");
    console.log("----------------------------------");
    console.log(anotherUserNFTList);
    console.log("\n");

    let ownerNFTList = await difinesNft.fetchMyNFT();
    console.log("----------------------------");
    console.log("------ Owner NFT Items -----");
    console.log("----------------------------");
    console.log(ownerNFTList);
    console.log("\n");
  });

  it("Display NFT TokenUri", async function () {
    let tokenUri1 = await difinesNft.tokenURI(1);
    console.log("tokenURI of 1(tokenID) = ", tokenUri1);
    let tokenUri2 = await difinesNft.tokenURI(2);
    console.log("tokenURI of 1(tokenID) = ", tokenUri2);
    let tokenUri3 = await difinesNft.tokenURI(3);
    console.log("tokenURI of 1(tokenID) = ", tokenUri3);
    console.log("\n");
  });

  it("Display NFT Marketplace Info", async function () {});
});
