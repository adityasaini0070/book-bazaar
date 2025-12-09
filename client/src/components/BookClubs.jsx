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
    FormControlLabel,
    Switch,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText
} from '@mui/material';
import {
    Groups as GroupsIcon,
    Add as AddIcon,
    Book as BookIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { 
    getAllBookClubs, 
    getBookClub, 
    createBookClub, 
    joinBookClub, 
    leaveBookClub,
    getMyBookClubs
} from '../api';
import { useAuth } from '../context/AuthContext';

function BookClubs() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { token, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [clubs, setClubs] = useState([]);
    const [myClubs, setMyClubs] = useState([]);
    const [selectedClub, setSelectedClub] = useState(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_private: false
    });

    useEffect(() => {
        fetchClubs();
        if (isAuthenticated) {
            fetchMyClubs();
        }
    }, []);

    useEffect(() => {
        if (id) {
            fetchClubDetails(id);
        }
    }, [id]);

    const fetchClubs = async () => {
        setLoading(true);
        try {
            const response = await getAllBookClubs();
            setClubs(response.data);
        } catch (err) {
            setError('Failed to load book clubs');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyClubs = async () => {
        try {
            const response = await getMyBookClubs(token);
            setMyClubs(response.data);
        } catch (err) {
            console.error('Failed to load my clubs:', err);
        }
    };

    const fetchClubDetails = async (clubId) => {
        setLoading(true);
        try {
            const response = await getBookClub(clubId);
            setSelectedClub(response.data);
        } catch (err) {
            setError('Failed to load club details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClub = async () => {
        if (!formData.name) {
            setError('Club name is required');
            return;
        }

        try {
            await createBookClub(formData, token);
            setSuccess('Book club created successfully!');
            setCreateDialogOpen(false);
            setFormData({ name: '', description: '', is_private: false });
            fetchClubs();
            fetchMyClubs();
        } catch (err) {
            setError('Failed to create book club');
        }
    };

    const handleJoinClub = async (clubId) => {
        try {
            await joinBookClub(clubId, token);
            setSuccess('Joined club successfully!');
            fetchClubs();
            fetchMyClubs();
            if (selectedClub && selectedClub.club.id === clubId) {
                fetchClubDetails(clubId);
            }
        } catch (err) {
            setError('Failed to join club');
        }
    };

    const handleLeaveClub = async (clubId) => {
        try {
            await leaveBookClub(clubId, token);
            setSuccess('Left club successfully');
            fetchClubs();
            fetchMyClubs();
            if (selectedClub && selectedClub.club.id === clubId) {
                fetchClubDetails(clubId);
            }
        } catch (err) {
            setError('Failed to leave club');
        }
    };

    const handleClubClick = (clubId) => {
        navigate(`/book-clubs/${clubId}`);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    // Show club details if ID is provided
    if (id && selectedClub) {
        const { club, members, currentBook } = selectedClub;
        const isMember = members.some(m => m.id === token);

        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

                <Button onClick={() => navigate('/book-clubs')} sx={{ mb: 2 }}>
                    ← Back to Clubs
                </Button>

                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box>
                                <Typography variant="h4" gutterBottom>
                                    {club.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Created by {club.creator_name}
                                </Typography>
                            </Box>
                            {isAuthenticated && (
                                <Button
                                    variant={isMember ? "outlined" : "contained"}
                                    onClick={() => isMember ? handleLeaveClub(club.id) : handleJoinClub(club.id)}
                                >
                                    {isMember ? 'Leave Club' : 'Join Club'}
                                </Button>
                            )}
                        </Box>

                        {club.description && (
                            <Typography variant="body1" paragraph>
                                {club.description}
                            </Typography>
                        )}

                        <Chip icon={<PersonIcon />} label={`${members.length} Members`} sx={{ mr: 1 }} />
                    </CardContent>
                </Card>

                <Grid container spacing={3}>
                    {/* Current Book */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Currently Reading
                                </Typography>
                                {currentBook ? (
                                    <Box>
                                        <Typography variant="h5">{currentBook.title}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            by {currentBook.author}
                                        </Typography>
                                        {currentBook.start_date && (
                                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                                Started: {new Date(currentBook.start_date).toLocaleDateString()}
                                            </Typography>
                                        )}
                                        {currentBook.end_date && (
                                            <Typography variant="caption" display="block">
                                                Ends: {new Date(currentBook.end_date).toLocaleDateString()}
                                            </Typography>
                                        )}
                                    </Box>
                                ) : (
                                    <Typography color="text.secondary">
                                        No book selected yet
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Members */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Members ({members.length})
                                </Typography>
                                <List>
                                    {members.slice(0, 5).map((member) => (
                                        <ListItem key={member.id}>
                                            <ListItemAvatar>
                                                <Avatar>{member.username.charAt(0).toUpperCase()}</Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={member.full_name || member.username}
                                                secondary={`@${member.username} • ${member.role}`}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                                {members.length > 5 && (
                                    <Typography variant="caption" color="text.secondary">
                                        and {members.length - 5} more...
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        );
    }

    // Show clubs list
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <GroupsIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                    <Typography variant="h4" component="h1">
                        Book Clubs
                    </Typography>
                </Box>
                {isAuthenticated && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateDialogOpen(true)}
                    >
                        Create Club
                    </Button>
                )}
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            {/* My Clubs */}
            {myClubs.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        My Clubs
                    </Typography>
                    <Grid container spacing={2}>
                        {myClubs.map((club) => (
                            <Grid item xs={12} sm={6} md={4} key={club.id}>
                                <Card sx={{ cursor: 'pointer' }} onClick={() => handleClubClick(club.id)}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {club.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" noWrap>
                                            {club.description}
                                        </Typography>
                                        <Chip 
                                            label={club.role} 
                                            size="small" 
                                            color="primary" 
                                            sx={{ mt: 1 }} 
                                        />
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* All Clubs */}
            <Typography variant="h5" gutterBottom>
                All Clubs
            </Typography>
            <Grid container spacing={3}>
                {clubs.length === 0 ? (
                    <Grid item xs={12}>
                        <Alert severity="info">No book clubs available yet. Create one!</Alert>
                    </Grid>
                ) : (
                    clubs.map((club) => (
                        <Grid item xs={12} sm={6} md={4} key={club.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" gutterBottom>
                                        {club.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {club.description}
                                    </Typography>
                                    <Box sx={{ mt: 2 }}>
                                        <Chip 
                                            icon={<PersonIcon />} 
                                            label={`${club.member_count} members`} 
                                            size="small" 
                                        />
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                        Created by {club.creator_username}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={() => handleClubClick(club.id)}
                                    >
                                        View Details
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>

            {/* Create Club Dialog */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create a Book Club</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Club Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        sx={{ mt: 2, mb: 2 }}
                        required
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        multiline
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.is_private}
                                onChange={(e) => setFormData({ ...formData, is_private: e.target.checked })}
                            />
                        }
                        label="Private Club"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateClub} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default BookClubs;
