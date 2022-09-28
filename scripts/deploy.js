// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const DifinesToken = await hre.ethers.getContractFactory("DifinesToken");
  const difinesToken = await DifinesToken.deploy(50000, "cBUSD", 18, "cBUSD");
  await difinesToken.deployed();
  console.log("cBUSD address: ", difinesToken.address);

  // We get the contract to deploy
  const DifinesNFT = await hre.ethers.getContractFactory("DifinesNFT");
  const difinesNft = await DifinesNFT.deploy(difinesToken.address, "0x9487C04A3fBf1EaF708b5cf19134ff53d246608c");

  await difinesNft.deployed();

  console.log("DifinesNFT deployed to:", difinesNft.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
