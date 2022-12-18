import { Helmet } from 'react-helmet-async';

// @mui
import { Container, Grid, Typography } from '@mui/material';

// components
// import PageHeader from './PageHeader';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import Footer from 'src/components/Footer';
import RepayBox from './RepayBox';

// style
import './RepayPage.scss';

function RepayPage() {
  return (
    <>
      <Helmet>
        <title>Borrow NFT</title>
      </Helmet>
      <PageTitleWrapper>
        <Typography variant="h2">Repay Page</Typography>
        {/* <PageHeader /> */}
      </PageTitleWrapper>
      <Container maxWidth="lg">
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={4}
        >
          <Grid item xs={12}>
            <RepayBox />
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}

export default RepayPage;
