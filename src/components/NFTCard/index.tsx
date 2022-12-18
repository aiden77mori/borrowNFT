import { useNavigate } from 'react-router';

// @mui
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  Avatar
} from '@mui/material';

// components
// import Modal from 'src/components/Modal';

// hooks
// import useToogle from 'src/hooks/useToogle';

// models
import { NftType } from 'src/models/nft_interface';

// style
import './NFTCard.scss';

interface ParentProps {
  nft?: NftType;
  nftType?: string;
}

function NFTCard({ nft, nftType }: ParentProps) {
  const navigate = useNavigate();
  // const { open, handleOpen, handleClose } = useToogle();

  const onAction = (id: string) => {
    navigate(`/dashboards/nfts/${id}`);
  };
  const viewUserProfile = (address: string) => {
    navigate(`/account/profile/${address}`);
  };
  // const openModal = () => {
  //   handleOpen();
  // };

  return (
    <>
      <Card className="nft-card">
        <Box className="nft-back-box">
          <CardMedia
            component="img"
            alt="nft-back"
            image={process.env.REACT_APP_PINATA_BASEURL + nft.img_url}
            className="nft-back"
            // onClick={openModal}
          />
          {nftType === 'mint' ? (
            <></>
          ) : (
            <Avatar
              src={nft.owner_img}
              alt="nft-owner-img"
              variant="rounded"
              className="nft-owner-img"
              onClick={() => viewUserProfile(nft.owner)}
            />
          )}
        </Box>
        {/* <Box className="like-group">
          <Box className="nav-like-group">
            <Box
              component="img"
              src="/static/images/hero/heart.svg"
              alt="like"
              className="like-btn"
            />
            <Typography className="like-num">77</Typography>
          </Box>
        </Box> */}

        <CardContent className="card-content">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            className="card-line"
          >
            <Typography className="nft-title title">{nft.name}</Typography>
            <Typography className="nft-id title">{nft.name}</Typography>
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            className="card-line"
          >
            <Typography className="nft-price title">
              {nft.price} BUSD ($1000.1)
            </Typography>
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            className="card-line"
          >
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              onClick={() => onAction(nft.id)}
            >
              {nftType === 'mint' && 'Mint & Detail'}
              {nftType === 'market' && 'Buy & Detail'}
              {nftType === 'user' && 'Action & Detail'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* <Modal open={open} handleClose={handleClose}>
        <img
          src={process.env.REACT_APP_PINATA_BASEURL + nft.img_url}
          loading="lazy"
          alt="zoom-NFT"
        />
      </Modal> */}
    </>
  );
}

export default NFTCard;
