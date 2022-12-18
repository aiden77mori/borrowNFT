import { Helmet } from 'react-helmet-async';

// @mui
import { Container, Grid } from '@mui/material';

// components
import PageHeader from './PageHeader';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import Footer from 'src/components/Footer';
import CreateBox from './CreateBox';

// style
import './Createplace.scss';

function MintPage() {
  return (
    <>
      <Helmet>
        <title>Mint NFT</title>
      </Helmet>
      <PageTitleWrapper>
        <PageHeader />
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
            <CreateBox />
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}

export default MintPage;
