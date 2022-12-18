require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

const projectId = "4c8bccb32aeb926dff5547fd";
//Kingdom application ID
// const projectId = "lo8dR3THgQ7Xp74KMIAI8VJBfLT5qhCBNMWHo6ep";
const apiKeyForEtherscan = "4KWQHG7RB749V28PG4457J6PQARXV3A4T3";

const privateKey = process.env.PRIVATEKEY;
const privateKey1 = process.env.PRIVATEKEY1;
const privateKey2 = process.env.PRIVATEKEY2;

const optimizerEnabled = true;

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.2",
        settings: {
          optimizer: {
            enabled: optimizerEnabled,
            runs: 1,
          },
          evmVersion: "berlin",
        },
      },
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: optimizerEnabled,
            runs: 1,
          },
          evmVersion: "berlin",
        },
      },
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: optimizerEnabled,
            runs: 1,
          },
          evmVersion: "berlin",
        },
      },
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: optimizerEnabled,
            runs: 1,
          },
          evmVersion: "berlin",
        },
      },
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: optimizerEnabled,
            runs: 1,
          },
          evmVersion: "berlin",
        },
      },
    ],
  },
  abiExporter: {
    path: "./abis",
    clear: true,
    flat: true,
  },
  etherscan: {
    apiKey: apiKeyForEtherscan,
  },
  gasReporter: {
    currency: "USD",
    gasPrice: 100,
    enabled: process.env.REPORT_GAS ? true : false,
  },
  mocha: {
    timeout: 30000,
  },
  networks: {
    hardhat: {
      chainId: 97, //bsctestnet
      allowUnlimitedContractSize: true,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    polygonmainnet: {
      url: `https://speedy-nodes-nyc.moralis.io/${projectId}/polygon/mainnet`,
      accounts: [privateKey, privateKey1, privateKey2],
    },
    mumbai: {
      url: `https://speedy-nodes-nyc.moralis.io/${projectId}/polygon/mumbai`,
      accounts: [privateKey, privateKey1, privateKey2],
    },
    ethermainnet: {
      url: `https://speedy-nodes-nyc.moralis.io/${projectId}/eth/mainnet`,
      accounts: [privateKey, privateKey1, privateKey2],
    },
    kovan: {
      url: `https://speedy-nodes-nyc.moralis.io/${projectId}/eth/kovan`,
      accounts: [privateKey, privateKey1, privateKey2],
    },
    rinkeby: {
      url: `https://speedy-nodes-nyc.moralis.io/${projectId}/eth/rinkeby`,
      accounts: [privateKey, privateKey1, privateKey2],
    },
    bscmainnet: {
      url: `https://bsc-dataseed2.ninicoin.io`,
      accounts: [privateKey, privateKey1, privateKey2],
    },
    fantom: {
      url: "https://rpc.ftm.tools/",
      accounts: [privateKey, privateKey1, privateKey2],
    },
    fantomtestnet: {
      url: "https://rpc.testnet.fantom.network",
      accounts: [privateKey, privateKey1, privateKey2],
    },
    bsctestnet: {
      url: `https://data-seed-prebsc-1-s1.binance.org:8545`,
      accounts: [privateKey, privateKey1, privateKey2],
    },
  },
};
