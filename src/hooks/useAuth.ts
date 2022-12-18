import { useCallback } from "react";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from "@web3-react/injected-connector";
import {
  UserRejectedRequestError as UserRejectedRequestErrorWalletConnect,
  WalletConnectConnector,
} from "@web3-react/walletconnect-connector";
import {
  connectorLocalStorageKey,
  ConnectorNames,
  connectorsByName,
} from "../utils/connectors";
import { addNetwork } from "../utils/wallet";
import { toast } from "react-hot-toast";

const useAuth = () => {
  const { activate, deactivate, library, chainId } = useWeb3React();

  const loginWallet = useCallback(
    (connectorID: ConnectorNames) => {
      const connector = connectorsByName[connectorID];
      if (connector) {
        activate(connector, async (error) => {
          window.localStorage.removeItem(connectorLocalStorageKey);
          if (error instanceof UnsupportedChainIdError) {
            toast.error("Unsupported Chain Id Error. Check your chain Id!");

            await addNetwork({
              library,
              chainId: chainId || 56,
            });
            activate(connector);
          } else if (error instanceof NoEthereumProviderError) {
            toast.error("No provider was found!!");
          } else if (
            error instanceof UserRejectedRequestErrorInjected ||
            error instanceof UserRejectedRequestErrorWalletConnect
          ) {
            if (connector instanceof WalletConnectConnector) {
              const walletConnector = connector;
              walletConnector.walletConnectProvider = null;
            }
            toast.error(
              "Authorization Error, Please authorize to access your account"
            );
            console.log(
              "Authorization Error, Please authorize to access your account"
            );
          } else {
            toast.error(error.message);
            console.log(error.name, error.message);
          }
        });
      } else {
        toast.error("Can't find connector, The connector config is wrong");
        console.log("Can't find connector", "The connector config is wrong");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activate]
  );

  const logoutWallet = useCallback(() => {
    deactivate();
    // This localStorage key is set by @web3-react/walletconnect-connector
    if (window.localStorage.getItem("walletconnect")) {
      connectorsByName.WalletConnect.close();
      connectorsByName.WalletConnect.walletConnectProvider = null;
    }
  }, [deactivate]);

  return { loginWallet, logoutWallet };
};

export default useAuth;
