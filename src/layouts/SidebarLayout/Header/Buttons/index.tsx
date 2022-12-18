import { Box } from '@mui/material';
import HeaderSearch from './Search';
import HeaderNotifications from './Notifications';

function HeaderButtons() {
  return (
    <Box sx={{ px: 1 }}>
      <HeaderSearch />
      <HeaderNotifications />
    </Box>
  );
}

export default HeaderButtons;
