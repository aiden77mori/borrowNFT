import { Typography, Grid, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

function PageHeader() {
  const user = {
    name: 'Catherine Pike',
    avatar: '/static/images/avatars/1.jpg'
  };
  const theme = useTheme();

  return (
    <Grid container spacing={{ xs: 2 }} className="pageHeader-section">
      <Grid item xs={12}>
        <Box className="hero-img">
          <img
            src="/static/images/createplace/createplace-hero.png"
            alt="marketplace-hero"
          />
        </Box>
      </Grid>
      <Grid item xs={12} md={6} lg={7}>
        <Box className="hero-title">
          <Typography variant="h2" component="h2" className="heading">
            New DeFi Demo
          </Typography>
          <Typography variant="subtitle2" className="desc">
            Discover, Collect & Create your own NFT. "Tiger Warriors” is the
            first NFT Collection designed and developed on Planet ZUUD. It is
            representing the Tiger Race whose story is going to be the first
            part of the Planet ZUUD story. It is a unique hand-drawn collection
            of 2222 Tiger Warriors. Holders receive move to earn utility.
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12} md={6} lg={5} sx={{ margin: 'auto' }}>
        <Box className="hero-statistic">
          <Box className="stat-item">
            <Typography className="state-item-title">Items</Typography>
            <Typography className="state-item-value">17700</Typography>
          </Box>
          <Box className="stat-item">
            <Typography className="state-item-title">Highest (BUSD)</Typography>
            <Typography className="state-item-value">10,000</Typography>
          </Box>
          <Box className="stat-item">
            <Typography className="state-item-title">Lowest (BUSD)</Typography>
            <Typography className="state-item-value">1</Typography>
          </Box>
          <Box className="stat-item">
            <Typography className="state-item-title">Floor (BUSD)</Typography>
            <Typography className="state-item-value">2777</Typography>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}

export default PageHeader;
