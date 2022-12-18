import { useState, useEffect } from 'react';
import { connectorLocalStorageKey, ConnectorNames } from '../utils/connectors';
import useAuth from './useAuth';

const _binanceChainListener = async () =>
  new Promise<void>((resolve) =>
    Object.defineProperty(window, 'BinanceChain', {
      get() {
        return this.bsc;
      },
      set(bsc) {
        this.bsc = bsc;
        resolve();
      }
    })
  );

export function useEagerConnect() {
  const [tried, setTried] = useState(false);
  const { loginWallet } = useAuth();

  useEffect(() => {
    const connectorId = window.localStorage.getItem(
      connectorLocalStorageKey
    ) as ConnectorNames;

    if (connectorId) {
      const isConnectorBinanceChain = connectorId === 'BinanceChainWallet';
      const isBinanceChainDefined = Reflect.has(window, 'BinanceChain');

      // Currently BSC extension doesn't always inject in time.
      // We must check to see if it exists, and if not, wait for it before proceeding.
      if (isConnectorBinanceChain && !isBinanceChainDefined) {
        _binanceChainListener().then(() => {
          loginWallet(connectorId);
          setTried(true);
        });

        return;
      }

      loginWallet(connectorId);
      setTried(true);
    }
  }, [loginWallet]);

  return tried;
}
