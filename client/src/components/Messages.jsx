import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    TextField,
    IconButton,
    Badge,
    CircularProgress,
    Alert,
    Divider,
    Paper
} from '@mui/material';
import {
    Send as SendIcon,
    Message as MessageIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { 
    getConversations, 
    getConversation, 
    sendMessage, 
    getUnreadCount 
} from '../api';
import { useAuth } from '../context/AuthContext';

function Messages() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchConversations();
        fetchUnreadCount();
    }, []);

    useEffect(() => {
        if (userId) {
            fetchMessages(userId);
        }
    }, [userId]);

    const fetchConversations = async () => {
        setLoading(true);
        try {
            const response = await getConversations(token);
            setConversations(response.data);
        } catch (err) {
            setError('Failed to load conversations');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (otherUserId) => {
        try {
            const response = await getConversation(otherUserId, token);
            setMessages(response.data);
            
            // Find conversation details from existing conversations
            let conv = conversations.find(c => c.other_user_id === parseInt(otherUserId));
            
            // If not found in conversations, try to get details from messages
            if (!conv && response.data.length > 0) {
                const firstMsg = response.data[0];
                const isRecipient = firstMsg.recipient_id === parseInt(otherUserId);
                conv = {
                    other_user_id: parseInt(otherUserId),
                    other_username: isRecipient ? firstMsg.recipient_username : firstMsg.sender_username,
                    other_full_name: null
                };
            }
            
            setSelectedConversation(conv || { 
                other_user_id: parseInt(otherUserId),
                other_username: 'User',
                other_full_name: null
            });
            
            // Refresh unread count after reading messages
            fetchUnreadCount();
        } catch (err) {
            setError('Failed to load messages');
            console.error(err);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await getUnreadCount(token);
            setUnreadCount(response.data.count);
        } catch (err) {
            console.error('Failed to fetch unread count:', err);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !userId) return;

        try {
            await sendMessage({
                recipient_id: userId,
                message: newMessage,
                subject: 'Message'
            }, token);

            setNewMessage('');
            fetchMessages(userId);
            fetchConversations();
            setSuccess('Message sent!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to send message');
        }
    };

    const handleSelectConversation = (conv) => {
        navigate(`/messages/${conv.other_user_id}`);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Badge badgeContent={unreadCount} color="error" sx={{ mr: 2 }}>
                    <MessageIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Badge>
                <Typography variant="h4" component="h1">
                    Messages
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Grid container spacing={2} sx={{ height: 'calc(100vh - 250px)' }}>
                {/* Conversations List */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', overflow: 'auto' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Conversations
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            {conversations.length === 0 ? (
                                <Typography color="text.secondary" align="center">
                                    No conversations yet
                                </Typography>
                            ) : (
                                <List>
                                    {conversations.map((conv) => (
                                        <ListItem
                                            key={conv.other_user_id}
                                            button
                                            selected={userId && parseInt(userId) === conv.other_user_id}
                                            onClick={() => handleSelectConversation(conv)}
                                            sx={{
                                                borderRadius: 1,
                                                mb: 1,
                                                '&.Mui-selected': {
                                                    backgroundColor: 'primary.light',
                                                    '&:hover': {
                                                        backgroundColor: 'primary.light',
                                                    }
                                                }
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar>
                                                    {conv.other_username?.charAt(0).toUpperCase()}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={conv.other_full_name || conv.other_username}
                                                secondary={
                                                    <Typography 
                                                        variant="body2" 
                                                        color="text.secondary"
                                                        noWrap
                                                        sx={{ 
                                                            fontWeight: !conv.is_read && conv.sender_id !== user?.id ? 'bold' : 'normal' 
                                                        }}
                                                    >
                                                        {conv.message}
                                                    </Typography>
                                                }
                                            />
                                            {!conv.is_read && conv.sender_id !== user?.id && (
                                                <Badge badgeContent="" color="primary" variant="dot" />
                                            )}
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Messages Area */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {userId && selectedConversation ? (
                            <>
                                {/* Header */}
                                <CardContent sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <IconButton 
                                            onClick={() => navigate('/messages')}
                                            sx={{ mr: 2, display: { md: 'none' } }}
                                        >
                                            <ArrowBackIcon />
                                        </IconButton>
                                        <Avatar sx={{ mr: 2 }}>
                                            {selectedConversation.other_username?.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6">
                                                {selectedConversation.other_full_name || selectedConversation.other_username}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                @{selectedConversation.other_username}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>

                                {/* Messages */}
                                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                                    {messages.length === 0 ? (
                                        <Typography color="text.secondary" align="center">
                                            No messages yet. Start a conversation!
                                        </Typography>
                                    ) : (
                                        messages.map((msg) => {
                                            const isSent = msg.sender_id === user?.id;
                                            return (
                                                <Box
                                                    key={msg.id}
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: isSent ? 'flex-end' : 'flex-start',
                                                        mb: 2
                                                    }}
                                                >
                                                    <Paper
                                                        sx={{
                                                            p: 2,
                                                            maxWidth: '70%',
                                                            backgroundColor: isSent ? 'primary.main' : 'grey.100',
                                                            color: isSent ? 'white' : 'text.primary'
                                                        }}
                                                    >
                                                        <Typography variant="body1">
                                                            {msg.message}
                                                        </Typography>
                                                        <Typography 
                                                            variant="caption" 
                                                            sx={{ 
                                                                display: 'block', 
                                                                mt: 0.5,
                                                                opacity: 0.8
                                                            }}
                                                        >
                                                            {new Date(msg.created_at).toLocaleString()}
                                                        </Typography>
                                                    </Paper>
                                                </Box>
                                            );
                                        })
                                    )}
                                </Box>

                                {/* Input */}
                                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <TextField
                                            fullWidth
                                            placeholder="Type a message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            multiline
                                            maxRows={4}
                                        />
                                        <IconButton 
                                            color="primary" 
                                            onClick={handleSendMessage}
                                            disabled={!newMessage.trim()}
                                        >
                                            <SendIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </>
                        ) : (
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    height: '100%'
                                }}
                            >
                                <Typography color="text.secondary">
                                    Select a conversation to start messaging
                                </Typography>
                            </Box>
                        )}
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}

export default Messages;
