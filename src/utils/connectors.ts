import { ethers } from "ethers";
import { InjectedConnector } from "@web3-react/injected-connector";
import { BscConnector } from "@binance-chain/bsc-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { ALL_SUPPORTED_CHAIN_IDS, currentNetwork, Networks } from "./index";

const Metamask = "assets/icons/Metamask.svg";
const TrustWallet = "assets/icons/TrustWallet.svg";
const WalletConnect = "assets/icons/WalletConnect.svg"
const BinanceChain = "assets/icons/BinanceChain.svg"

declare var window: any;

const NETWORK_URLS: { [key: number]: string } = {
  [Networks.MainNet]: `https://data-seed-prebsc-1-s1.binance.org:8545/`,
  [Networks.Testnet]: `https://bsc-dataseed1.ninicoin.io`,
};

export enum ConnectorNames {
  Injected = "Injected",
  WalletConnect = "WalletConnect",
  BinanceChainWallet = "BinanceChainWallet",
}

export const injectedConnector = new InjectedConnector({
  supportedChainIds: ALL_SUPPORTED_CHAIN_IDS,
});

export const bscConnector = new BscConnector({
  supportedChainIds: ALL_SUPPORTED_CHAIN_IDS,
});

export const walletconnect = new WalletConnectConnector({
  rpc: NETWORK_URLS,
  bridge: "https://pancakeswap.bridge.walletconnect.org/",
  qrcode: true,
});

export const connectorsByName = {
  Injected: injectedConnector,
  WalletConnect: walletconnect,
  BinanceChainWallet: bscConnector,
};

export const connectors =
  +currentNetwork === 56
    ? [
        {
          title: "Metamask",
          icon: Metamask,
          connectorId: ConnectorNames.Injected,
        },
        {
          title: "TrustWallet",
          icon: TrustWallet,
          connectorId: ConnectorNames.Injected,
        },
        {
          title: "WalletConnect",
          icon: WalletConnect,
          connectorId: ConnectorNames.WalletConnect,
        },
        {
          title: "Binance Chain Wallet",
          icon: BinanceChain,
          connectorId: ConnectorNames.BinanceChainWallet,
        },
      ]
    : [
        {
          title: "Metamask",
          icon: Metamask,
          connectorId: ConnectorNames.Injected,
        },
      ];

export const connectorLocalStorageKey: string = "difinesNFTMarketplaceId";

/**
 * BSC Wallet requires a different sign method
 * @see https://docs.binance.org/smart-chain/wallet/wallet_api.html#binancechainbnbsignaddress-string-message-string-promisepublickey-string-signature-string
 */
export const signMessage = async (
  provider: any,
  account: string,
  message: string
) => {
  if (window.BinanceChain) {
    const { signature } = await (window.BinanceChain as any).bnbSign(
      account,
      message
    );
    return signature;
  }

  /**
   * Wallet Connect does not sign the message correctly unless you use their method
   * @see https://github.com/WalletConnect/walletconnect-monorepo/issues/462
   */
  if (provider.provider?.wc) {
    const wcMessage = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(message));
    const signature = await provider.provider?.wc.signPersonalMessage([
      wcMessage,
      account,
    ]);
    return signature;
  }

  return provider.getSigner(account).signMessage(message);
};
