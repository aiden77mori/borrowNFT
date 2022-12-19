import { useState, useRef } from 'react';

// @mui
import {
  Box,
  alpha,
  Stack,
  lighten,
  Divider,
  IconButton,
  Tooltip,
  styled,
  useTheme,
  Typography,
  SwipeableDrawer
} from '@mui/material';
import MenuTwoToneIcon from '@mui/icons-material/MenuTwoTone';
import CloseTwoToneIcon from '@mui/icons-material/CloseTwoTone';
import { Global } from '@emotion/react';
import { grey } from '@mui/material/colors';

// hooks
import useDimension from 'src/hooks/useDimension';

// components
import TopMenu from './TopMenu';
import HeaderUserbox from '../Userbox';
import MobileMenu from './MobileMenu';

const HeaderWrapper = styled(Box)(
  ({ theme }) => `
        height: ${theme.header.height};
        color: ${theme.header.textColor};
        padding: ${theme.spacing(0, 2)};
        right: 0;
        z-index: 30;
        // background: linear-gradient(90deg, rgba(3, 6, 66, 0.12) 0%, rgba(3, 6, 66, 0.5) 52%, rgba(3, 6, 66, 0) 100%);
        background: #1f243a;
        border-bottom: 1px solid #3e4859;
        position: fixed;
        justify-content: space-between;
        width: 100%;
        @media (min-width: ${theme.breakpoints.values.lg}px) {
            left: 0;
            width: auto;
        }
`
);

const drawerBleeding = 56;

interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window?: () => Window;
}

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? '#fff' : grey[800]
}));

const Puller = styled(Box)(({ theme }) => ({
  width: 30,
  height: 6,
  backgroundColor: theme.palette.mode === 'light' ? grey[300] : grey[900],
  borderRadius: 3,
  position: 'absolute',
  top: 8,
  left: 'calc(50% - 15px)'
}));

function Topbar(props: Props) {
  const theme = useTheme();
  const targetRef = useRef<any>(null);
  const size = useDimension(targetRef);
  const { window } = props;
  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    if (size.width < 960) setOpen(newOpen);
  };

  // This is used only for the example
  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <>
      <HeaderWrapper
        display="flex"
        alignItems="center"
        ref={targetRef}
        sx={{
          boxShadow:
            theme.palette.mode === 'dark'
              ? `0 1px 0 ${alpha(
                  lighten(theme.colors.primary.main, 0.7),
                  0.15
                )}, 0px 2px 8px -3px rgba(0, 0, 0, 0.2), 0px 5px 22px -4px rgba(0, 0, 0, .1)`
              : `0px 2px 8px -3px ${alpha(
                  theme.colors.alpha.black[100],
                  0.2
                )}, 0px 5px 22px -4px ${alpha(
                  theme.colors.alpha.black[100],
                  0.1
                )}`
        }}
      >
        <Stack
          direction="row"
          divider={<Divider orientation="vertical" flexItem />}
          alignItems="center"
          spacing={2}
        >
          <TopMenu />
        </Stack>
        <Box display="flex" alignItems="center">
          <HeaderUserbox />
          <Box
            component="span"
            sx={{
              display: { md: 'none', xs: 'inline-block' }
            }}
          >
            <Tooltip arrow title="Toggle Menu">
              <IconButton sx={{ color: '#fff' }} onClick={toggleDrawer(true)}>
                {!open ? (
                  <MenuTwoToneIcon fontSize="small" />
                ) : (
                  <CloseTwoToneIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </HeaderWrapper>

      <Global
        styles={{
          '.MuiDrawer-root > .MuiPaper-root': {
            height: `calc(60% - ${drawerBleeding}px)`,
            overflow: 'visible'
          }
        }}
      />
      <SwipeableDrawer
        container={container}
        anchor="bottom"
        open={open}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
        swipeAreaWidth={drawerBleeding}
        disableSwipeToOpen={true}
        ModalProps={{
          keepMounted: true
        }}
      >
        <StyledBox
          sx={{
            px: 2,
            pb: 2,
            height: '100%',
            overflow: 'auto'
          }}
        >
          <Puller />
          <Typography sx={{ p: 2, color: 'text.secondary' }}>
            Mobile Menu
          </Typography>
          <MobileMenu closeMenu={toggleDrawer} />
        </StyledBox>
      </SwipeableDrawer>
    </>
  );
}

export default Topbar;
