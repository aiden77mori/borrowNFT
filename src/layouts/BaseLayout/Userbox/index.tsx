import { useRef, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// @mui
import { Box, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

// hooks
import { useWeb3React } from '@web3-react/core';
import { useForm } from 'react-hook-form';
import useToogle from 'src/hooks/useToogle';
import useAuth from 'src/hooks/useAuth';

// utils
import { shorter } from 'src/utils';
import { connectorLocalStorageKey, ConnectorNames } from 'src/utils/connectors';

// components
import Loader from 'src/components/Loader';

const UserBoxButton = styled(Box)(
  ({ theme }) => `
      padding: 0 ${theme.spacing(1)};
      display: flex;
      align-items: center;
      cursor: pointer;
`
);

interface ImageUrlProps {
  realUrl: any;
  virtualUrl: string;
}
interface UserInfoProps {
  nickName: string;
  bio: string;
}
const initialState: UserInfoProps = {
  nickName: '',
  bio: ''
};

function HeaderUserbox() {
  const { account } = useWeb3React();
  const { loginWallet, logoutWallet } = useAuth();
  const { open, handleOpen, handleClose } = useToogle();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>('none');
  const [userInfo, setUserInfo] = useState<UserInfoProps>({
    ...initialState
  });
  const [imgUrl, setImgUrl] = useState<ImageUrlProps>({
    realUrl: '',
    virtualUrl: ''
  });
  const [isOpen, setOpen] = useState<boolean>(false);
  const refBox = useRef<any>(null);
  const fileRef = useRef<any>(null);

  const {
    formState: { errors }
  } = useForm<UserInfoProps>();

  useEffect(() => {}, [account]);

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
