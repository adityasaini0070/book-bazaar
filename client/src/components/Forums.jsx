import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    CircularProgress,
    Chip,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    IconButton,
    Divider
} from '@mui/material';
import {
    Forum as ForumIcon,
    Add as AddIcon,
    Comment as CommentIcon,
    Visibility as VisibilityIcon,
    ThumbUp as ThumbUpIcon
} from '@mui/icons-material';
import { 
    getAllForums, 
    getForum, 
    createForum, 
    replyToForum,
    likeReply
} from '../api';
import { useAuth } from '../context/AuthContext';

function Forums() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { token, user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [forums, setForums] = useState([]);
    const [selectedForum, setSelectedForum] = useState(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: ''
    });

    useEffect(() => {
        if (id) {
            fetchForumDetails(id);
        } else {
            fetchForums();
        }
    }, [id]);

    const fetchForums = async () => {
        setLoading(true);
        try {
            const response = await getAllForums();
            setForums(response.data);
        } catch (err) {
            setError('Failed to load forums');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchForumDetails = async (forumId) => {
        setLoading(true);
        try {
            const response = await getForum(forumId);
            setSelectedForum(response.data);
        } catch (err) {
            setError('Failed to load forum details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateForum = async () => {
        if (!formData.title || !formData.description) {
            setError('Title and description are required');
            return;
        }

        try {
            await createForum(formData, token);
            setSuccess('Forum created successfully!');
            setCreateDialogOpen(false);
            setFormData({ title: '', description: '' });
            fetchForums();
        } catch (err) {
            setError('Failed to create forum');
        }
    };

    const handleReply = async () => {
        if (!replyText.trim()) {
            setError('Reply cannot be empty');
            return;
        }

        try {
            await replyToForum(id, { content: replyText }, token);
            setSuccess('Reply posted!');
            setReplyText('');
            fetchForumDetails(id);
        } catch (err) {
            setError('Failed to post reply');
        }
    };

    const handleLike = async (replyId) => {
        try {
            await likeReply(replyId, token);
            fetchForumDetails(id);
        } catch (err) {
            setError('Failed to like reply');
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    // Show forum details
    if (id && selectedForum) {
        const { forum, replies } = selectedForum;

        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

                <Button onClick={() => navigate('/forums')} sx={{ mb: 2 }}>
                    ← Back to Forums
                </Button>

                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h4" gutterBottom>
                            {forum.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Started by {forum.creator_name} • {new Date(forum.created_at).toLocaleDateString()}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body1">
                            {forum.description}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <Chip icon={<VisibilityIcon />} label={`${forum.view_count} views`} size="small" sx={{ mr: 1 }} />
                            <Chip icon={<CommentIcon />} label={`${replies.length} replies`} size="small" />
                        </Box>
                    </CardContent>
                </Card>

                {/* Replies */}
                <Typography variant="h6" gutterBottom>
                    Replies ({replies.length})
                </Typography>
                <List>
                    {replies.map((reply) => (
                        <Card key={reply.id} sx={{ mb: 2 }}>
                            <ListItem alignItems="flex-start">
                                <ListItemAvatar>
                                    <Avatar>{reply.username.charAt(0).toUpperCase()}</Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="subtitle2">
                                                {reply.full_name || reply.username}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(reply.created_at).toLocaleString()}
                                            </Typography>
                                        </Box>
                                    }
                                    secondary={
                                        <>
                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                                {reply.content}
                                            </Typography>
                                            {isAuthenticated && (
                                                <Box sx={{ mt: 1 }}>
                                                    <IconButton size="small" onClick={() => handleLike(reply.id)}>
                                                        <ThumbUpIcon fontSize="small" />
                                                    </IconButton>
                                                    <Typography variant="caption">{reply.likes}</Typography>
                                                </Box>
                                            )}
                                        </>
                                    }
                                />
                            </ListItem>
                        </Card>
                    ))}
                </List>

                {/* Reply Input */}
                {isAuthenticated && (
                    <Card sx={{ mt: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Post a Reply
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                placeholder="Write your reply..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                            />
                        </CardContent>
                        <CardActions>
                            <Button variant="contained" onClick={handleReply}>
                                Post Reply
                            </Button>
                        </CardActions>
                    </Card>
                )}
            </Container>
        );
    }

    // Show forums list
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ForumIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                    <Typography variant="h4" component="h1">
                        Discussion Forums
                    </Typography>
                </Box>
                {isAuthenticated && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateDialogOpen(true)}
                    >
                        New Discussion
                    </Button>
                )}
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Grid container spacing={2}>
                {forums.length === 0 ? (
                    <Grid item xs={12}>
                        <Alert severity="info">No discussions yet. Start one!</Alert>
                    </Grid>
                ) : (
                    forums.map((forum) => (
                        <Grid item xs={12} key={forum.id}>
                            <Card sx={{ cursor: 'pointer' }} onClick={() => navigate(`/forums/${forum.id}`)}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {forum.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" noWrap>
                                        {forum.description}
                                    </Typography>
                                    <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                                        <Chip icon={<CommentIcon />} label={`${forum.reply_count} replies`} size="small" />
                                        <Chip icon={<VisibilityIcon />} label={`${forum.view_count} views`} size="small" />
                                        <Typography variant="caption" color="text.secondary">
                                            by {forum.creator_name}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>

            {/* Create Forum Dialog */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Start a Discussion</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        sx={{ mt: 2, mb: 2 }}
                        required
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        multiline
                        rows={6}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateForum} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default Forums;
