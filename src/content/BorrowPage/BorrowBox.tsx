import { useState, useEffect } from 'react';
import axios from 'axios';

// hooks
import { useWeb3React } from '@web3-react/core';
import useCallContract from 'src/hooks/useCallContract';
import { utils } from 'ethers';

// @mui
import {
  Grid,
  Box,
  TextField,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography
} from '@mui/material';

interface NFTObject {
  tokenId: string;
  title: string;
  description: string;
  amount: string;
  image: string;
}

function BorrowBox() {
  const { account, chainId } = useWeb3React();
  const { fetchMarketItem, borrowNFT } = useCallContract();
  const [nftList, setNftList] = useState<NFTObject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [borrowLoading, setBorrowLoading] = useState<boolean>(false);
  const [borrowed, setBorrowed] = useState<boolean>(false);

  const handleBorrow = async (nftId: string) => {
    setBorrowLoading(true);

    try {
      await borrowNFT(nftId);
      setBorrowLoading(false);
      setBorrowed((prev) => !prev);
    } catch (err) {
      console.error(err);
      setBorrowLoading(false);
      setBorrowed((prev) => !prev);
    }
  };

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      let result = await fetchMarketItem();
      const filteredRes = result.filter((res: any) => !res.borrowed);
      let temp = [];
      for (let i = 1; i < filteredRes.length; i++) {
        let resFromUrl = await axios.get(
          process.env.REACT_APP_IPFS_BASEURL + filteredRes[i].tokenUri
        );
        let object = {
          tokenId: filteredRes[i].tokenId,
          title: resFromUrl.data.title,
          description: resFromUrl.data.description,
          amount: utils.formatEther(filteredRes[i].tokenAmount),
          image: resFromUrl.data.image
        };
        temp.push(object);
      }
      setNftList(temp);
      setIsLoading(false);
    }

    if (account) init();

    return setNftList([]);
  }, [account, chainId, borrowed]);

  return (
    <Grid container spacing={2} className="borrow-section">
      {isLoading ? (
        <Typography variant="h2">'loading...'</Typography>
      ) : (
        nftList.map((nftItem, idx) => (
          <Grid item xs={1} sm={2} md={3} key={idx}>
            <Card sx={{ maxWidth: 345 }}>
              <CardMedia
                component="img"
                alt="green iguana"
                height="140"
                image={process.env.REACT_APP_IPFS_BASEURL + nftItem.image}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {nftItem.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {nftItem.description}
                </Typography>
                <Typography variant="h4" gutterBottom>
                  {nftItem.amount}
                </Typography>
              </CardContent>
              <CardActions>
                <Button onClick={() => handleBorrow(nftItem.tokenId)}>
                  {borrowLoading ? 'loading...' : 'Borrow'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))
      )}
    </Grid>
  );
}

export default BorrowBox;
