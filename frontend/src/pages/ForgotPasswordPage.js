import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  Link
} from '@mui/material';
import {
  Email,
  ArrowBack,
  Send
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      setSuccess(true);
      toast.success('Password reset instructions sent to your email');
      
      // In development, show additional feedback
      if (response.data.resetLink) {
        console.log('Reset Link:', response.data.resetLink);
        
        if (response.data.emailSent === false) {
          toast.error('Email service not configured. Check console for reset link.', { duration: 8000 });
          console.warn('Email Configuration Error:', response.data.emailError);
        } else if (response.data.emailSent === true) {
          toast.success('Email sent successfully!', { duration: 5000 });
        } else {
          toast.success('Development: Check console for reset link', { duration: 5000 });
        }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'An error occurred. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={10}
            sx={{
              p: 4,
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Back Button */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/login')}
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { backgroundColor: 'transparent', color: 'primary.main' }
                }}
              >
                Back to Login
              </Button>
            </Box>

            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                Forgot Password?
              </Typography>
              <Typography variant="body1" color="text.secondary">
                No worries! Enter your email address and we'll send you instructions to reset your password.
              </Typography>
            </Box>

            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Alert 
                  severity="success" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    '& .MuiAlert-icon': { fontSize: '1.5rem' }
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Check your email!
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    We've sent password reset instructions to <strong>{email}</strong>
                  </Typography>
                </Alert>

                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Didn't receive the email? Check your spam folder or try again.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSuccess(false);
                      setEmail('');
                    }}
                    sx={{ mr: 2 }}
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="contained"
                    component={RouterLink}
                    to="/login"
                  >
                    Back to Login
                  </Button>
                </Box>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  error={!!error}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={<Send />}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(79, 70, 229, 0.4)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {loading ? 'Sending...' : 'Send Reset Instructions'}
                </Button>
              </form>
            )}

            {/* Footer */}
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Remember your password?{' '}
                <Link 
                  component={RouterLink} 
                  to="/login"
                  sx={{ 
                    fontWeight: 600,
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage; 