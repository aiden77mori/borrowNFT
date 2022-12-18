import { useState, useEffect } from 'react';

// hooks
import { useWeb3React } from '@web3-react/core';

// @mui
import { Grid, Box, TextField, Button, Card, Typography } from '@mui/material';

function BorrowPage() {
  const { account } = useWeb3React();

  useEffect(() => {}, []);

  return (
    <Grid container spacing={6} className="borrow-section">
      <Grid item xs={12} sm={12} md={12}></Grid>
    </Grid>
  );
}

export default BorrowPage;
