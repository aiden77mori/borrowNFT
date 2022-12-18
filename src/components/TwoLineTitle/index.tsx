import { ReactNode } from 'react';

// @mui
import { Box, Typography } from '@mui/material';

// style
import './TwoLineTitle.scss';

interface ParentProps {
  topTitle: String;
  downTitle: String | ReactNode;
}

function TwoLineTitle({ topTitle, downTitle }: ParentProps) {
  return (
    <Box className="two-line-title">
      <Typography className="state-item-title">{topTitle}</Typography>
      <Typography className="state-item-value">{downTitle}</Typography>
    </Box>
  );
}

export default TwoLineTitle;
