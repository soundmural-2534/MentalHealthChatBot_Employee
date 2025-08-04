import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = ({ 
  message = 'Loading...', 
  size = 40,
  fullScreen = true,
  color = 'primary'
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullScreen ? '100vh' : '200px',
        gap: 2,
        color: 'white'
      }}
    >
      <CircularProgress 
        size={size} 
        sx={{ 
          color: color === 'primary' ? '#ffffff' : color 
        }} 
      />
      <Typography 
        variant="body1" 
        sx={{ 
          color: 'white',
          textAlign: 'center',
          fontWeight: 500
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner; 