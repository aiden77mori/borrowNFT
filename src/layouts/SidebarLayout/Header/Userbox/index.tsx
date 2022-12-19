import { useRef, useState } from 'react';

// @mui
import { Box, Button, lighten, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

// hooks
import { useWeb3React } from '@web3-react/core';
import useAuth from 'src/hooks/useAuth';
// import useSendFileToIPFS from 'src/hooks/useSendFileToIPFS';

// utils
import { shorter } from 'src/utils';
import { connectorLocalStorageKey, ConnectorNames } from 'src/utils/connectors';

const UserBoxButton = styled(Box)(
  ({ theme }) => `
      padding: 0 ${theme.spacing(1)};
      display: flex;
      align-items: center;
      cursor: pointer;
`
);

interface ImageUrlProps {
  realUrl: string;
  virtualUrl: string;
}
interface UserInfoProps {
  nickName: string;
  bio: string;
}

function HeaderUserbox() {
  const { account } = useWeb3React();
  const { loginWallet, logoutWallet } = useAuth();

  const [isOpen, setOpen] = useState<boolean>(false);
  const refBox = useRef<any>(null);

  const profileOpen = (): void => {
    if (account) setOpen(true);
  };
  const profileClose = (): void => {
    setOpen(false);
  };
  function connectWallet() {
    loginWallet(ConnectorNames.Injected);
    window.localStorage.setItem(
      connectorLocalStorageKey,
      ConnectorNames.Injected
    );
    profileClose();
  }

  return (
    <>
      <UserBoxButton color="secondary" ref={refBox} onClick={profileOpen}>
        <Button
          size="small"
          variant="contained"
          color="primary"
          className="connectWallet"
          onClick={connectWallet}
        >
          {account ? shorter(account) : 'Connect Wallet'}
        </Button>
      </UserBoxButton>
    </>
  );
}

export default HeaderUserbox;
