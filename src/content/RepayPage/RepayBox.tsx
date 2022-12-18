import { useState, useEffect } from 'react';
import axios from 'axios';

// hooks
import { useWeb3React } from '@web3-react/core';
import useCallContract from 'src/hooks/useCallContract';
import { utils } from 'ethers';

// @mui
import {
  Grid,
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

function RepayBox() {
  const { account, chainId } = useWeb3React();
  const { fetchMarketItem, repayNFT } = useCallContract();
  const [nftList, setNftList] = useState<NFTObject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [repayLoading, setRepayLoading] = useState<boolean>(false);
  const [repaid, setRepaid] = useState<boolean>(false);

  const handleRepay = async (nftId: string, amount: string) => {
    setRepayLoading(true);

    try {
      await repayNFT(nftId, amount);
      setRepayLoading(false);
      setRepaid((prev) => !prev);
    } catch (err) {
      console.error(err);
      setRepayLoading(false);
      setRepaid((prev) => !prev);
    }
  };

  useEffect(() => {
    async function init() {
      if (!account) return;
      setIsLoading(true);
      let result = await fetchMarketItem();
      const filteredRes = result.filter((res: any) => res.borrowed);
      let temp = [];
      for (let i = 0; i < filteredRes.length; i++) {
        let resFromUrl = await axios.get(filteredRes[i].tokenUri);
        let object = {
          tokenId: filteredRes[i].tokenId,
          title: resFromUrl.data.title,
          description: resFromUrl.data.description,
          amount: utils.formatEther(filteredRes[i].tokenAmount),
          image: resFromUrl.data.image
        };
        temp.push(object);
      }
      console.log(temp);
      setNftList(temp);
      setIsLoading(false);
    }

    init();

    return setNftList([]);
  }, [account, chainId, repaid]);

  return (
    <Grid container spacing={2} className="repay-section">
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
                image={process.env.REACT_APP_PINATA_BASEURL + nftItem.image}
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
                <Button
                  size="small"
                  onClick={() => handleRepay(nftItem.tokenId, nftItem.amount)}
                >
                  {repayLoading ? 'loading...' : 'Repay'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))
      )}
    </Grid>
  );
}

export default RepayBox;
