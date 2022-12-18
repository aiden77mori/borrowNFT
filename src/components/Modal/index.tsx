import React from 'react';

// @mui
import { Backdrop, Box, Modal, Fade } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// styles
import './Modal.scss';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  outline: 'none'
};

interface ModalProps {
  open: boolean;
  handleClose: any;
  children: React.ReactNode;
}

export default function TransitionsModal({
  children,
  open,
  handleClose
}: ModalProps) {
  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={open}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500
      }}
      className="modal-section"
    >
      <Fade in={open}>
        <Box sx={style} className="modal-nav-box">
          <Box sx={{ position: 'relative' }}>
            <CloseIcon className="moda-close-icon" onClick={handleClose} />
            {children}
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}
