import { NavLink } from 'react-router-dom';

// @mui
import { Box, List, ListItem, ListItemText } from '@mui/material';

function MobileMenu({ closeMenu }: any) {
  return (
    <List disablePadding component={Box} display="flex" flexDirection="column">
      <ListItem
        classes={{ root: 'MuiListItem-indicators' }}
        button
        component={NavLink}
        to="/"
        onClick={closeMenu(false)}
      >
        <ListItemText
          primaryTypographyProps={{ noWrap: true }}
          primary="Mint"
        />
      </ListItem>
      <ListItem
        classes={{ root: 'MuiListItem-indicators' }}
        button
        component={NavLink}
        to="/borrow"
        onClick={closeMenu(false)}
      >
        <ListItemText
          primaryTypographyProps={{ noWrap: true }}
          primary="Borrow"
        />
      </ListItem>
      <ListItem
        classes={{ root: 'MuiListItem-indicators' }}
        button
        component={NavLink}
        to="/repay"
        onClick={closeMenu(false)}
      >
        <ListItemText
          primaryTypographyProps={{ noWrap: true }}
          primary="Repay"
        />
      </ListItem>
    </List>
  );
}

export default MobileMenu;
