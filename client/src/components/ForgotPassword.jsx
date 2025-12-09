import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Alert
} from '@mui/material';
import { forgotPassword } from '../api';

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetToken, setResetToken] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email) {
            setError('Email is required');
            return;
        }

        setLoading(true);
        try {
            const response = await forgotPassword(email);
            setSuccess(response.data.message);
            // In development, show the token
            if (response.data.resetToken) {
                setResetToken(response.data.resetToken);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to process request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
            <Card>
                <CardContent>
                    <Typography variant="h4" gutterBottom align="center">
                        Forgot Password
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph align="center">
                        Enter your email address and we'll send you instructions to reset your password.
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                    {resetToken && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            <Typography variant="body2" gutterBottom>
                                <strong>Development Mode:</strong> Use this token to reset your password:
                            </Typography>
                            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                {resetToken}
                            </Typography>
                            <Button
                                size="small"
                                variant="outlined"
                                sx={{ mt: 1 }}
                                onClick={() => navigate(`/reset-password/${resetToken}`)}
                            >
                                Go to Reset Password
                            </Button>
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{ mb: 2 }}
                            required
                        />

                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{ mb: 2 }}
                        >
                            {loading ? 'Sending...' : 'Send Reset Instructions'}
                        </Button>

                        <Button
                            fullWidth
                            variant="text"
                            onClick={() => navigate('/login')}
                        >
                            Back to Login
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
}

export default ForgotPassword;
