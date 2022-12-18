import { Contract } from '@ethersproject/contracts';
import { Provider } from '@ethersproject/abstract-provider';
import { BigNumber, ethers } from 'ethers';
import Web3Modal from 'web3modal';
import Web3 from 'web3';

// abi
import BorrowNFTABI from './abis/BorrowNFT.json';
import TestTokenABI from './abis/TestToken.json';

export const NetworkName = {
  56: 'Binance Smart Chain',
  97: 'Binance Smart Chain TestNet'
};

export const Networks = {
  MainNet: 56,
  Testnet: 97
};

export const ALL_SUPPORTED_CHAIN_IDS: number[] = [
  Networks.MainNet,
  Networks.Testnet
];

interface ContractInfo {
  address: string;
  abi: any;
}

export const CONTRACTS_BY_NETWORK: {
  [key: number]: { [key: string]: ContractInfo };
} = {
  [Networks.MainNet]: {
    BorrowNFT: {
      address: '',
      abi: BorrowNFTABI.abi
    },
    TestToken: {
      address: '',
      abi: TestTokenABI.abi
    }
  },
  [Networks.Testnet]: {
    BorrowNFT: {
      address: '0xa2409f61a249165Fe3325242d75897B84a7bE85d',
      abi: BorrowNFTABI.abi
    },
    TestToken: {
      address: '0xD6D362222d24D922486AF0643529Bb324F831612',
      abi: TestTokenABI.abi
    }
  }
};

export const BIG_ZERO = BigNumber.from(0);
export const ZERO_ADDRESS = ethers.constants.AddressZero;

export const currentNetwork: number =
  parseInt(process.env.REACT_APP_NETWORK_ID || '') || 56;

export const simpleProvider: Provider = new ethers.providers.JsonRpcProvider(
  process.env.REACT_APP_NODE_1
);

export function getContractInfo(
  name: string,
  chainId: number | undefined = undefined
) {
  if (!chainId) chainId = currentNetwork;

  const contracts = CONTRACTS_BY_NETWORK?.[chainId];
  if (contracts) {
    return contracts?.[name];
  } else {
    return null;
  }
}

export function getContractAddress(
  name: string,
  chainId: number | undefined = undefined
) {
  if (!chainId) chainId = currentNetwork;

  const contracts = CONTRACTS_BY_NETWORK?.[chainId];
  if (contracts) {
    return contracts?.[name]?.address?.toLowerCase();
  } else {
    return null;
  }
}

export function getContractObj(
  name: string,
  chainId: number | undefined,
  provider: Provider | undefined
) {
  const info = getContractInfo(name, chainId);
  return info
    ? new Contract(info.address, info.abi, provider || simpleProvider)
    : null;
}

export const getProvider = async () => {
  const web3Modal = new Web3Modal();
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  return provider;
};

export const getSigner = async () => {
  const web3Modal = new Web3Modal();
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();
  return signer;
};

export const getContractByWeb3 = async (
  name: string,
  chainId: number | undefined
) => {
  let provider = window.ethereum;
  const web3 = new Web3(provider);
  const info = getContractInfo(name, chainId);
  return new web3.eth.Contract(info.abi, info.address);
};

export const getContract = async (
  name: string,
  chainId: number | undefined
) => {
  const web3Modal = new Web3Modal();
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();
  const info = getContractInfo(name, chainId);
  return new ethers.Contract(info.address, info.abi, signer);
};

export const shorter = (str: string) =>
  str?.length > 8 ? str.slice(0, 6) + '...' + str.slice(-4) : str;

export function numberWithCommas(x: number) {
  var parts = x.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

export function letteredNumber(num: number) {
  if (num > 999 && num < 1000000) {
    return (num / 1000).toFixed(1) + 'K'; // convert to K for number from > 1000 < 1 million
  } else if (num > 1000000) {
    return (num / 1000000).toFixed(1) + 'M'; // convert to M for number from > 1 million
  } else if (num > 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B'; // convert to M for number from > 1 million
  } else if (num > 1000000000000) {
    return (num / 1000000000000).toFixed(1) + 'T'; // convert to M for number from > 1 million
  } else if (num < 1000) {
    return num; // if value < 1000, nothing to do
  }
}