import ReactDOM from 'react-dom';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';

import 'nprogress/nprogress.css';
import App from 'src/App';
import { SidebarProvider } from 'src/contexts/SidebarContext';
import * as serviceWorker from 'src/serviceWorker';

import ToastContainer from 'src/components/ToastContainer';

import { Web3ReactProvider } from '@web3-react/core';
import {
  ExternalProvider,
  JsonRpcFetchFunc,
  Web3Provider
} from '@ethersproject/providers';

function getLibrary(provider: ExternalProvider | JsonRpcFetchFunc) {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

ReactDOM.render(
  <Web3ReactProvider getLibrary={getLibrary}>
    <HelmetProvider>
      <SidebarProvider>
        <BrowserRouter>
          <ToastContainer />
          <App />
        </BrowserRouter>
      </SidebarProvider>
    </HelmetProvider>
  </Web3ReactProvider>,
  document.getElementById('root')
);

serviceWorker.unregister();
