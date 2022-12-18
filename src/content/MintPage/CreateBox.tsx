import { useState, useRef } from 'react';

// @mui
import { Grid, Box, TextField, Button, Card, Typography } from '@mui/material';

// hooks
import { useWeb3React } from '@web3-react/core';
import useCallContract from 'src/hooks/useCallContract';
import useSendFileToIPFS from 'src/hooks/useSendFileToIPFS';
import { useSendJsonIPFS } from 'src/hooks/useSendFileToIPFS';

interface ImageUrlProps {
  real: string;
  virtual: string;
}
interface NftInfoProps {
  title: string;
  description: string;
  amount: number;
}

function CreateBox() {
  const { mintNFT } = useCallContract();
  const { account } = useWeb3React();
  const fileRef = useRef<any>(null);
  const [imgUrl, setImgUrl] = useState<ImageUrlProps>({
    real: '',
    virtual: ''
  });
  const [nftInfo, setNFTInfo] = useState<NftInfoProps>({
    title: '',
    description: '',
    amount: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const goToEdit = () => {
    if (isLoading) return;
    open('https://nft.difines.io/art');
  };

  const triggerPreviewImage = () => {
    fileRef.current?.click();
  };

  const previewImage = (evt: any) => {
    evt.persist();
    const file = evt.target.files[0];
    if (file)
      setImgUrl({
        real: file,
        virtual: window.URL.createObjectURL(file)
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNFTInfo({
      ...nftInfo,
      [name]: value
    });
  };

  const handleMint = async () => {
    // before mint, should check user test token balance
    if (isLoading) return;
    setIsLoading(true);
    if (
      !account ||
      !imgUrl.real ||
      !nftInfo.description ||
      !nftInfo.title ||
      !nftInfo.amount
    ) {
      return;
    }
    try {
      // upload image to pinata
      const formImageData = new FormData();
      formImageData.append('file', imgUrl.real);
      const resImage = await useSendFileToIPFS(formImageData);
      console.log(resImage.data.IpfsHash);
      // upload json metadata to pinata with img url
      const metaData = JSON.stringify({
        title: nftInfo.title,
        description: nftInfo.description,
        image: resImage.data.IpfsHash,
        amount: nftInfo.amount
      });
      const resMetaData = await useSendJsonIPFS(metaData);
      console.log(resMetaData.data.IpfsHash);

      // mint NFT with metadata
      await mintNFT(resMetaData.data.IpfsHash, nftInfo.amount);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }

    setIsLoading(false);
  };
  const cancelCreate = () => {
    if (isLoading) return;
    setIsLoading(false);
    setNFTInfo({
      title: '',
      description: '',
      amount: 0
    });
    setImgUrl({
      real: '',
      virtual: ''
    });
  };

  return (
    <Grid container spacing={6} className="createBox-section">
      <Grid item xs={12} sm={12} md={12}>
        <Card className="create-info-box">
          <Typography variant="h3">
            1900 / 2000 NFT left to create & mint (100 NFT created & minted)
          </Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={6}>
        <Card className="left-card">
          <div>
            <TextField
              label="Title"
              placeholder="NFT best Character NinJa"
              variant="standard"
              name="title"
              onChange={handleChange}
              value={nftInfo.title}
            />
            {isLoading && !nftInfo.title && (
              <div className="nft-warn">Title is required</div>
            )}
          </div>
          <div>
            <TextField
              label="Description"
              multiline
              rows={4}
              placeholder="This is best NFT character..."
              variant="standard"
              name="description"
              onChange={handleChange}
              value={nftInfo.description}
            />
            {isLoading && !nftInfo.description && (
              <div className="nft-warn">Description is required</div>
            )}
          </div>
          <div>
            <TextField
              label="tokenAmount"
              variant="standard"
              type="number"
              name="amount"
              onChange={handleChange}
              value={nftInfo.amount}
            />
            {isLoading && !nftInfo.amount && (
              <div className="nft-warn">Amount should bigger than 0</div>
            )}
          </div>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={6}>
        <Card className="preview-card">
          <Box className="right">
            <Box className="preview-image" onClick={triggerPreviewImage}>
              {imgUrl.virtual ? (
                <img
                  src={imgUrl.virtual}
                  alt="preview-image"
                  className="preview-img-tag"
                />
              ) : (
                <img
                  src="/static/images/createplace/upload-img.png"
                  alt="upload-img-icon"
                  className="upload-img-icon"
                />
              )}
            </Box>
            <input
              type="file"
              accept="image/*"
              ref={fileRef}
              onChange={previewImage}
              hidden
            />
          </Box>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card className="btn-group">
          <Button
            className="mint-btn btn"
            variant="outlined"
            color="primary"
            size="small"
            onClick={handleMint}
          >
            {isLoading ? 'loading...' : 'Mint'}
          </Button>
          <Button
            className="mint-btn btn"
            variant="outlined"
            color="success"
            size="small"
            onClick={goToEdit}
          >
            {isLoading ? 'loading...' : 'Edit Image'}
          </Button>
          <Button
            className="cancel-btn btn"
            variant="outlined"
            color="secondary"
            size="small"
            onClick={cancelCreate}
          >
            {isLoading ? 'loading...' : 'Cancel'}
          </Button>
        </Card>
      </Grid>
    </Grid>
  );
}

export default CreateBox;
