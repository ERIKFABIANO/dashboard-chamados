import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// project imports
import DrawerHeaderStyled from './DrawerHeaderStyled';
import codeappeLogo from 'assets/images/users/logo.png';

// ==============================|| DRAWER HEADER ||============================== //

export default function DrawerHeader({ open }) {
  return (
    <DrawerHeaderStyled
      open={open}
      sx={{
        minHeight: '60px',
        width: 'initial',
        paddingTop: '8px',
        paddingBottom: '8px',
        paddingLeft: open ? '24px' : 0
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Logo CodeAppe sem hyperlink */}
        <Box sx={{ width: open ? 170 : 40, height: open ? 50 : 40 }}>
          <img
            src={codeappeLogo}
            alt="Logo"
            style={{ height: '100%', width: 'auto', objectFit: 'contain', display: 'block' }}
          />
        </Box>
        {/* Título removido conforme solicitado */}
      </Box>
    </DrawerHeaderStyled>
  );
}

DrawerHeader.propTypes = { open: PropTypes.bool };
