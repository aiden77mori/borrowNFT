import { ReactNode } from 'react';
import PropTypes from 'prop-types';
import { Outlet } from 'react-router-dom';

// @mui
import { Box } from '@mui/material';

// components
import Topbar from '../BaseLayout/Topbar';

// scss
import "./BaseLayout.scss";

interface BaseLayoutProps {
  children?: ReactNode;
}

const BaseLayout = ({ children }: BaseLayoutProps) => {
  return (
    <Box
      sx={{
        flex: 1,
        height: '100%'
      }}
    >
      <Topbar />
      {children || <Outlet />}
    </Box>
  );
};

BaseLayout.propTypes = {
  children: PropTypes.node
};

export default BaseLayout;
