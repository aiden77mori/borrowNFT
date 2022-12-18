import { useState } from 'react';
import { useNavigate } from 'react-router';

// hooks
import { useWeb3React } from '@web3-react/core';
import { utils } from 'ethers';
import { toast } from 'react-hot-toast';

import Web3 from 'web3';

// utils
import { getContract, getContractByWeb3 } from 'src/utils';

const useCallContract = () => {
  const { account, chainId } = useWeb3React();
  const navigate = useNavigate();

  /**
   * @function mintNFT
   * @param tokenUri
   * @param tokenAmount
   */
  const mintNFT = async (tokenUri: string, tokenAmount: number) => {
    try {
      const borrowAmount = utils.parseUnits(tokenAmount.toString(), 18);
      const borrowNFT = await getContractByWeb3('BorrowNFT', chainId);
      const testToken = await getContract('TestToken', chainId);
      let tx = await testToken.approve(borrowNFT.options.address, borrowAmount);
      await tx.wait();

      await borrowNFT.methods
        .mintNFT(tokenUri, utils.parseUnits(tokenAmount.toString(), 18))
        .send({ from: account })
        .on('confirmation', function (confirmationNumber, receipt) {})
        .on('receipt', async function (receipt: any) {
          const tokenId = Number(receipt.events.MintNFT.returnValues.tokenId);
          const eventName = receipt.events.MintNFT.event;
          // const mintPrice = Number(
          //   utils.formatEther(receipt.events.MintNFT.returnValues.price)
          // );
          // const fromAddr = receipt.events.Transfer.returnValues.from;
          // const toAddr = receipt.events.Transfer.returnValues.to;
          const transactionHash = receipt.transactionHash;
          // const web3 = new Web3(window.ethereum);
          // const blockData = await web3.eth.getBlock(receipt.blockNumber);
          console.log('mint transaction: ', transactionHash);
          console.log('event name: ', eventName);
          console.log('minted tokenId: ', tokenId);
          navigate('/borrow');
        });

      toast.success('You mint NFT successfully.');
    } catch (err) {
      console.error('While minting NFT error is occured: ', err);
      toast.error(err.message);
    }
  };

  /**
   * @function borrowNFT
   * @param nftId
   */
  const borrowNFT = async (nftId: string) => {
    try {
      const borrowNFTContract = await getContractByWeb3('BorrowNFT', chainId);
      await borrowNFTContract.methods
        .borrowNFT(nftId)
        .send({ from: account })
        .on('confirmation', function (confirmationNumber, receipt) {})
        .on('receipt', async function (receipt: any) {
          console.log(receipt);
        });

      toast.success('You borrowed successfully.');
    } catch (err) {
      console.error('White borrowing NFT error is occured: ', err);
      toast.error(err.message);
    }
  };

  /**
   * @function fetchMarketItem
   */
  const fetchMarketItem = async () => {
    const borrowNFT = await getContractByWeb3('BorrowNFT', chainId);
    const mintedNFT = await borrowNFT.methods.fetchMarketItems().call();

    return mintedNFT;
  };

  /**
   * @function repayNFT
   * @param nftId
   */
  const repayNFT = async (nftId: string, tokenAmount: string) => {
    try {
      const repayAmount = utils.parseUnits(Number(tokenAmount).toString(), 18);
      const borrowNFTContract = await getContractByWeb3('BorrowNFT', chainId);
      const testToken = await getContract('TestToken', chainId);
      let tx = await testToken.approve(
        borrowNFTContract.options.address,
        repayAmount
      );
      await tx.wait();
      await borrowNFTContract.methods
        .rePayNFT(nftId)
        .send({ from: account })
        .on('confirmation', function (confirmationNumber, receipt) {})
        .on('receipt', async function (receipt: any) {
          console.log(receipt);
        });

      toast.success('You repaid successfully.');
    } catch (err) {
      console.error('White repaying NFT error is occured: ', err);
      toast.error(err.message);
    }
  };

  return {
    mintNFT,
    fetchMarketItem,
    borrowNFT,
    repayNFT
  };
};

export default useCallContract;
