const { expect } = require("chai");
const { ethers } = require("hardhat");

let difinesNft;
let owner;
let user;
let anotherUser;

describe("NFT", function () {
  it("Should return the new greeting once it's changed", async function () {
    [owner, user, anotherUser] = await ethers.getSigners();
    const DifinesNFT = await ethers.getContractFactory("DifinesNFT");
    difinesNft = await DifinesNFT.deploy();
    await difinesNft.deployed();
  });

  it("Should mint NFT", async function () {
    let tx = await difinesNft.mintNFT(owner.address, "https://difines.io/");
    await tx.wait();
    console.log(tx.hash);
  });

  it("Should fetch all NFT", async function () {
    let list = await difinesNft.fetchMarketItems();
    console.log(list);
  });
});
