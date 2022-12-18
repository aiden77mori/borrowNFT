import { useRef, useEffect, useState } from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import useDimension from '../../hooks/useDimension';

import './Carousel.scss';

const sliderOption = {
  autoPlay: true,
  dynamicHeight: true,
  showThumbs: false,
  infiniteLoop: true,
  interval: 5000
};

function  HeroCarousel() {
  const targetRef = useRef<any>(null);
  const size = useDimension(targetRef);
  const [refHeight, setRefHeight] = useState<number>(size.height);

  useEffect(() => {
    if (size.height > 0) setRefHeight(size.height);

    return setRefHeight(null);
  }, [size.height]);

  return (
    <Carousel {...sliderOption}>
      <Box className="slide-one-group" height={refHeight}>
        <Box
          component="img"
          src="static/images/hero/1.jpg"
          alt="slide-1"
          ref={targetRef}
          className="slide-backImage"
        />
        <Box
          component="img"
          src="static/images/hero/hero-vector.png"
          alt="hero-vector"
          className="hero-vector"
        />
        <Box className="slide-content">
          <Container maxWidth="lg" className="slide-container">
            <Box className="left">
              <Typography variant="h1" component="h1" gutterBottom>
                Shop our latest collection of 10000 billionaire apes NFTs
              </Typography>
              <Typography variant="subtitle2">
                Today is a good day to start trading crypto assets!
              </Typography>
              <Button variant="contained" color="primary">
                Create Your NFT
              </Button>
            </Box>
            <Box
              component="img"
              src="static/images/hero/hero-img1.png"
              alt="hero-image"
              className="hero-image"
            />
          </Container>
        </Box>
      </Box>
      <Box className="slide-one-group" height={refHeight}>
        <Box
          component="img"
          src="static/images/hero/2.jpg"
          alt="slide-2"
          className="slide-backImage"
        />
        <Box
          component="img"
          src="static/images/hero/hero-vector.png"
          alt="hero-vector"
          className="hero-vector"
        />
        <Box className="slide-content">
          <Container maxWidth="lg" className="slide-container">
            <Box className="left">
              <Typography variant="h1" component="h1" gutterBottom>
                Shop our latest collection of 10000 billionaire apes NFTs
              </Typography>
              <Typography variant="subtitle2">
                Today is a good day to start trading crypto assets!
              </Typography>
              <Button variant="contained" color="primary">
                Create Your NFT
              </Button>
            </Box>
            <Box
              component="img"
              src="static/images/hero/hero-img2.png"
              alt="hero-image"
              className="hero-image"
            />
          </Container>
        </Box>
      </Box>
      <Box className="slide-one-group" height={refHeight}>
        <Box
          component="img"
          src="static/images/hero/3.jpg"
          alt="slide-3"
          className="slide-backImage"
        />
        <Box
          component="img"
          src="static/images/hero/hero-vector.png"
          alt="hero-vector"
          className="hero-vector"
        />
        <Box className="slide-content">
          <Container maxWidth="lg" className="slide-container">
            <Box className="left">
              <Typography variant="h1" component="h1" gutterBottom>
                Shop our latest collection of 10000 billionaire apes NFTs
              </Typography>
              <Typography variant="subtitle2">
                Today is a good day to start trading crypto assets!
              </Typography>
              <Button variant="contained" color="primary">
                Create Your NFT
              </Button>
            </Box>
            <Box
              component="img"
              src="static/images/hero/hero-img3.png"
              alt="hero-image"
              className="hero-image"
            />
          </Container>
        </Box>
      </Box>
    </Carousel>
  );
}

export default HeroCarousel;
