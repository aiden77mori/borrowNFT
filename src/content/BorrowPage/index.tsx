import { Helmet } from 'react-helmet-async';

// @mui
import { Container, Grid, Typography } from '@mui/material';

// components
// import PageHeader from './PageHeader';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import Footer from 'src/components/Footer';
import BorrowBox from './BorrowBox';

// style
import './BorrowPage.scss';

function BorrowPage() {
  return (
    <>
      <Helmet>
        <title>Borrow NFT</title>
      </Helmet>
      <PageTitleWrapper>
        <Typography variant="h2">Borrow Page</Typography>
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
            <BorrowBox />
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}

export default BorrowPage;