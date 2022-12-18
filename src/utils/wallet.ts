// Set of helper functions to facilitate wallet setup

import { nodes } from './getRpcUrl';
import { Web3Provider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { hexStripZeros } from '@ethersproject/bytes';

interface AddNetworkArguments {
  library: Web3Provider;
  chainId: number;
}

// provider.request returns Promise<any>, but wallet_switchEthereumChain must return null or throw
// see https://github.com/rekmarks/EIPs/blob/3326-create/EIPS/eip-3326.md for more info on wallet_switchEthereumChain
export async function addNetwork({
  library,
  chainId
}: AddNetworkArguments): Promise<null | void> {
  if (!library?.provider?.request) {
    return;
  }
  try {
    await library?.provider.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: `0x${chainId.toString(16)}`,
          chainName:
            chainId === 97
              ? 'Binance Smart Chain Testnet'
              : 'Binance Smart Chain Mainnet',
          nativeCurrency: {
            name: 'BNB',
            symbol: 'bnb',
            decimals: 18
          },
          rpcUrls: nodes,
          blockExplorerUrls: [
            chainId === 97
              ? 'https://testnet.bscscan.com/'
              : 'https://bscscan.com/'
          ]
        }
      ]
    });
  } catch (error) {
    console.error('error adding eth network: ', chainId, error);
  }
}

interface SwitchNetworkArguments {
  library: Web3Provider;
  chainId?: number;
}

// provider.request returns Promise<any>, but wallet_switchEthereumChain must return null or throw
// see https://github.com/rekmarks/EIPs/blob/3326-create/EIPS/eip-3326.md for more info on wallet_switchEthereumChain
export async function switchToNetwork({
  library,
  chainId
}: SwitchNetworkArguments): Promise<null | void> {
  if (!library?.provider?.request) {
    return;
  }
  if (!chainId && library?.getNetwork) {
    ({ chainId } = await library.getNetwork());
  }
  const formattedChainId = hexStripZeros(BigNumber.from(chainId).toHexString());
  try {
    await library?.provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: formattedChainId }]
    });
  } catch (error: any) {
    // 4902 is the error code for attempting to switch to an unrecognized chainId
    if (error.code === 4902 && chainId !== undefined) {
      // metamask (only known implementer) automatically switches after a network is added
      // the second call is done here because that behavior is not a part of the spec and cannot be relied upon in the future
      // metamask's behavior when switching to the current network is just to return null (a no-op)
      await addNetwork({ library, chainId });
      await switchToNetwork({ library, chainId });
    } else {
      throw error;
    }
  }
}
