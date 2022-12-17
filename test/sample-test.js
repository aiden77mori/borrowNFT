const { expect } = require("chai");
const { ethers } = require("hardhat");

let borrowNFT;
let testToken;
let owner;
let user;
let anotherUser;
const firstNFTTokenAmount = 100;
const secondNFTTokenAmount = 500;
const thirdNFTTOkenAmount = 1000;

describe("BorrowNFT Marketplace", function () {
  it("Deploy BorrowNFT and TestToken Contract", async function () {
    [owner, user, anotherUser] = await ethers.getSigners();

    const TestToken = await ethers.getContractFactory("TestToken");
    testToken = await TestToken.deploy();
    await testToken.deployed();

    console.log("----- Test Token Address -----");
    console.log(testToken.address);
    console.log("\n");

    const BorrowNFT = await ethers.getContractFactory("BorrowNFT");
    borrowNFT = await BorrowNFT.deploy(testToken.address);
    await borrowNFT.deployed();

    console.log("----- BorrowNFT Contract Address -----");
    console.log(borrowNFT.address);
    console.log("\n");
  });

  it("Should Mint NFT", async function () {
    await testToken.transfer(
      user.address,
      ethers.utils.parseUnits(Number(1000).toString(), 18)
    );
    await testToken.transfer(
      anotherUser.address,
      ethers.utils.parseUnits(Number(1000).toString(), 18)
    );

    console.log("------ Owner, User, AnotherUser's balance ------");
    console.log(
      "Owner = ",
      ethers.utils.formatEther(await testToken.balanceOf(owner.address))
    );
    console.log(
      "User = ",
      ethers.utils.formatEther(await testToken.balanceOf(user.address))
    );
    console.log(
      "AnotherUser = ",
      ethers.utils.formatEther(await testToken.balanceOf(anotherUser.address))
    );

    // user's nft mint
    // before mint, should call erc20 approve function

    await testToken
      .connect(user)
      .approve(
        borrowNFT.address,
        ethers.utils.parseUnits(Number(firstNFTTokenAmount).toString(), 18)
      );
    let txUser = await borrowNFT
      .connect(user)
      .mintNFT(
        "https://difines.io/user/tokenUri",
        ethers.utils.parseUnits(Number(firstNFTTokenAmount).toString(), 18)
      );
    await txUser.wait();
    console.log("User mint hash result = ", txUser.hash);
    console.log(
      "pool balance after mint: ",
      ethers.utils.formatEther(await testToken.balanceOf(borrowNFT.address))
    );

    // anotherUser's nft mint
    // before mint, should call erc20 approve function
    await testToken
      .connect(anotherUser)
      .approve(
        borrowNFT.address,
        ethers.utils.parseUnits(Number(secondNFTTokenAmount).toString(), 18)
      );
    let txAnotherUser = await borrowNFT
      .connect(anotherUser)
      .mintNFT(
        "https://difines.io/anotherUser/tokenUri",
        ethers.utils.parseUnits(Number(secondNFTTokenAmount).toString(), 18)
      );
    await txAnotherUser.wait();
    console.log("AnotherUser mint hash result = ", txAnotherUser.hash);
    console.log(
      "pool balance after mint: ",
      ethers.utils.formatEther(await testToken.balanceOf(borrowNFT.address))
    );
  });

  it("Should Borrow NFT", async () => {
    console.log(
      "owner balance before borow: ",
      ethers.utils.formatEther(await testToken.balanceOf(owner.address))
    );
    let borrowTx = await borrowNFT.borrowNFT(0);
    borrowTx.wait();
    console.log("borrow transaction: ", borrowTx.hash);
    console.log(
      "owner balance before borow: ",
      ethers.utils.formatEther(await testToken.balanceOf(owner.address))
    );
  });

  it("Should repay NFT", async () => {
    console.log(
      "pool balance before repay: ",
      ethers.utils.formatEther(await testToken.balanceOf(borrowNFT.address))
    );
    let approveTx = await testToken.approve(
      borrowNFT.address,
      ethers.utils.parseUnits(Number(firstNFTTokenAmount).toString(), 18)
    );
    await approveTx.wait();
    console.log("approve hash: ", approveTx.hash);

    let repayTx = await borrowNFT.rePayNFT(0);
    await repayTx.wait();
    console.log("repay transaction hash: ", repayTx.hash);
    console.log(
      "pool balance after repay: ",
      ethers.utils.formatEther(await testToken.balanceOf(borrowNFT.address))
    );
  });

  it("Should fetch NFT", async function () {
    let list = await borrowNFT.fetchMarketItems();
    console.log("------ NFT Market Items -----");
    console.log(list);
    console.log("\n");

    let userNFTList = await borrowNFT.connect(user).fetchMyNFT(user.address);
    console.log("------ User NFT Items -----");
    console.log(userNFTList);
    console.log("\n");

    let anotherUserNFTList = await borrowNFT
      .connect(anotherUser)
      .fetchMyNFT(anotherUser.address);
    console.log("------ AnotherUser NFT Items -----");
    console.log(anotherUserNFTList);
    console.log("\n");

    let ownerNFTList = await borrowNFT.fetchMyNFT(owner.address);
    console.log("------ Owner NFT Items -----");
    console.log(ownerNFTList);
    console.log("\n");
  });

  it("Display NFT TokenUri", async function () {
    let tokenUri1 = await borrowNFT.tokenURI(0);
    console.log("tokenURI of 0(tokenID) = ", tokenUri1);
    let tokenUri2 = await borrowNFT.tokenURI(1);
    console.log("tokenURI of 1(tokenID) = ", tokenUri2);
    // let tokenUri3 = await borrowNFT.tokenURI(2);
    // console.log("tokenURI of 2(tokenID) = ", tokenUri3);
    console.log("\n");
  });

  it("Display NFT Marketplace Info", async function () {
    let maxSupply = await borrowNFT.maxSupply();
    console.log("\nMax Supply = ", maxSupply);
    let owner = await borrowNFT.owner();
    console.log("Owner = ", owner);
    let operator = await borrowNFT.getOwner();
    expect(operator).to.equal(operator);
  });
});
