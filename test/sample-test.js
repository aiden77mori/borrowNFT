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
    busdToken = await BUSDToken.deploy(10000, "cBUSD", 18, "cBUSD");
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
    // before mint, should call erc20 approve function
    await busdToken
      .connect(user)
      .approve(difinesNft.address, ethers.utils.parseUnits(Number(3000).toString(), 18));
    let tx = await difinesNft.connect(user).mintNFT("https://difines.io/", 250);
    await tx.wait();
    console.log(tx.hash);

    console.log("----------------------------");
    console.log("------ User`s address ------");
    console.log("----------------------------");
    console.log(await user.address);
    console.log("\n");

    console.log("----------------------------");
    console.log("------ User`s balance ------");
    console.log("----------------------------");
    console.log(ethers.utils.formatEther(await busdToken.balanceOf(user.address)));
    console.log("\n");
    expect(await busdToken.balanceOf(user.address)).to.equal(
      ethers.utils.parseUnits(Number(2000).toString(), 18)
    );
  });

  it("Should fetch all NFT", async function () {
    let list = await difinesNft.fetchMarketItems();
    console.log("-----------------------------");
    console.log("------ NFT Market Items -----");
    console.log("-----------------------------");
    console.log(list);
    console.log("\n");
  });
});
