import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Button,
    Avatar,
    Chip,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton
} from '@mui/material';
import {
    Person as PersonIcon,
    Edit as EditIcon,
    LocationOn as LocationIcon,
    CalendarToday as CalendarIcon,
    Book as BookIcon,
    Store as StoreIcon,
    Message as MessageIcon,
    PersonAdd as PersonAddIcon,
    PersonRemove as PersonRemoveIcon
} from '@mui/icons-material';
import { 
    getUserProfile, 
    updateUserProfile, 
    followUser, 
    unfollowUser, 
    checkFollowStatus,
    getUserFollowers,
    getUserFollowing
} from '../api';
import { useAuth } from '../context/AuthContext';

function UserProfile() {
    const { username } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, token, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [profileData, setProfileData] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);
    const [editFormData, setEditFormData] = useState({
        bio: '',
        location: '',
        favorite_genres: [],
        reading_goal: 0
    });

    const isOwnProfile = currentUser?.username === username;

    useEffect(() => {
        fetchProfile();
        if (isAuthenticated && !isOwnProfile) {
            checkIsFollowing();
        }
    }, [username]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await getUserProfile(username);
            setProfileData(response.data);
            setEditFormData({
                bio: response.data.user.bio || '',
                location: response.data.user.location || '',
                favorite_genres: response.data.user.favorite_genres || [],
                reading_goal: response.data.user.reading_goal || 0
            });
        } catch (err) {
            setError('Failed to load profile');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const checkIsFollowing = async () => {
        try {
            if (profileData?.user?.id) {
                const response = await checkFollowStatus(profileData.user.id, token);
                setIsFollowing(response.data.isFollowing);
            }
        } catch (err) {
            console.error('Error checking follow status:', err);
        }
    };

    const handleFollowToggle = async () => {
        try {
            if (isFollowing) {
                await unfollowUser(profileData.user.id, token);
                setSuccess('Unfollowed successfully');
                setIsFollowing(false);
            } else {
                await followUser(profileData.user.id, token);
                setSuccess('Followed successfully');
                setIsFollowing(true);
            }
            fetchProfile(); // Refresh to update follower count
        } catch (err) {
            setError('Failed to update follow status');
        }
    };

    const handleEditProfile = async () => {
        try {
            await updateUserProfile(editFormData, token);
            setSuccess('Profile updated successfully');
            setEditDialogOpen(false);
            fetchProfile();
        } catch (err) {
            setError('Failed to update profile');
        }
    };

    const handleViewFollowers = async () => {
        try {
            const response = await getUserFollowers(profileData.user.id);
            setFollowers(response.data);
            setShowFollowers(true);
        } catch (err) {
            setError('Failed to load followers');
        }
    };

    const handleViewFollowing = async () => {
        try {
            const response = await getUserFollowing(profileData.user.id);
            setFollowing(response.data);
            setShowFollowing(true);
        } catch (err) {
            setError('Failed to load following');
        }
    };

    const handleSendMessage = () => {
        navigate(`/messages/${profileData.user.id}`);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!profileData) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">Profile not found</Alert>
            </Container>
        );
    }

    const { user, books, followers: followerCount, following: followingCount, activeListings } = profileData;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            {/* Profile Header */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
                            <Avatar
                                sx={{ 
                                    width: 120, 
                                    height: 120, 
                                    margin: '0 auto',
                                    bgcolor: 'primary.main',
                                    fontSize: '3rem'
                                }}
                            >
                                {user.username.charAt(0).toUpperCase()}
                            </Avatar>
                        </Grid>
                        <Grid item xs={12} md={9}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box>
                                    <Typography variant="h4" gutterBottom>
                                        {user.full_name || user.username}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        @{user.username}
                                    </Typography>
                                </Box>
                                <Box>
                                    {isOwnProfile ? (
                                        <Button
                                            variant="outlined"
                                            startIcon={<EditIcon />}
                                            onClick={() => setEditDialogOpen(true)}
                                        >
                                            Edit Profile
                                        </Button>
                                    ) : (
                                        <>
                                            {isAuthenticated && (
                                                <>
                                                    <Button
                                                        variant={isFollowing ? "outlined" : "contained"}
                                                        startIcon={isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
                                                        onClick={handleFollowToggle}
                                                        sx={{ mr: 1 }}
                                                    >
                                                        {isFollowing ? 'Unfollow' : 'Follow'}
                                                    </Button>
                                                    <IconButton 
                                                        color="primary" 
                                                        onClick={handleSendMessage}
                                                        sx={{ border: 1, borderColor: 'divider' }}
                                                    >
                                                        <MessageIcon />
                                                    </IconButton>
                                                </>
                                            )}
                                        </>
                                    )}
                                </Box>
                            </Box>

                            {user.bio && (
                                <Typography variant="body1" paragraph>
                                    {user.bio}
                                </Typography>
                            )}

                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                                {user.location && (
                                    <Chip icon={<LocationIcon />} label={user.location} variant="outlined" />
                                )}
                                <Chip 
                                    icon={<PersonIcon />} 
                                    label={`${followerCount} Followers`} 
                                    onClick={handleViewFollowers}
                                    clickable
                                />
                                <Chip 
                                    icon={<PersonIcon />} 
                                    label={`${followingCount} Following`} 
                                    onClick={handleViewFollowing}
                                    clickable
                                />
                                <Chip icon={<BookIcon />} label={`${books.length} Books`} variant="outlined" />
                                <Chip icon={<StoreIcon />} label={`${activeListings} Active Listings`} variant="outlined" />
                            </Box>

                            {user.favorite_genres && user.favorite_genres.length > 0 && (
                                <Box>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Favorite Genres:
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {user.favorite_genres.map((genre, index) => (
                                            <Chip key={index} label={genre} size="small" color="primary" />
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Tabs for Books and Activity */}
            <Card>
                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                    <Tab label={`Books (${books.length})`} />
                    <Tab label="Activity" />
                </Tabs>

                <CardContent>
                    {tabValue === 0 && (
                        <Grid container spacing={2}>
                            {books.length === 0 ? (
                                <Grid item xs={12}>
                                    <Typography color="text.secondary" align="center">
                                        No books yet
                                    </Typography>
                                </Grid>
                            ) : (
                                books.map((book) => (
                                    <Grid item xs={12} sm={6} md={4} key={book.id}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="h6" noWrap>
                                                    {book.title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    by {book.author}
                                                </Typography>
                                                <Typography variant="body2" color="primary">
                                                    ${parseFloat(book.price).toFixed(2)}
                                                </Typography>
                                                {book.genre && (
                                                    <Chip label={book.genre} size="small" sx={{ mt: 1 }} />
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))
                            )}
                        </Grid>
                    )}

                    {tabValue === 1 && (
                        <Typography color="text.secondary" align="center">
                            Activity feed coming soon...
                        </Typography>
                    )}
                </CardContent>
            </Card>

            {/* Edit Profile Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Bio"
                        multiline
                        rows={4}
                        value={editFormData.bio}
                        onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                        sx={{ mt: 2, mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Location"
                        value={editFormData.location}
                        onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Favorite Genres (comma-separated)"
                        value={editFormData.favorite_genres.join(', ')}
                        onChange={(e) => setEditFormData({ 
                            ...editFormData, 
                            favorite_genres: e.target.value.split(',').map(g => g.trim()).filter(g => g) 
                        })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        type="number"
                        label="Reading Goal (books per year)"
                        value={editFormData.reading_goal}
                        onChange={(e) => setEditFormData({ ...editFormData, reading_goal: parseInt(e.target.value) || 0 })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleEditProfile} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Followers Dialog */}
            <Dialog open={showFollowers} onClose={() => setShowFollowers(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Followers</DialogTitle>
                <DialogContent>
                    {followers.map((follower) => (
                        <Box key={follower.id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ mr: 2 }}>{follower.username.charAt(0).toUpperCase()}</Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body1">{follower.full_name || follower.username}</Typography>
                                <Typography variant="body2" color="text.secondary">@{follower.username}</Typography>
                            </Box>
                            <Button 
                                size="small" 
                                onClick={() => {
                                    setShowFollowers(false);
                                    navigate(`/profile/${follower.username}`);
                                }}
                            >
                                View
                            </Button>
                        </Box>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowFollowers(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Following Dialog */}
            <Dialog open={showFollowing} onClose={() => setShowFollowing(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Following</DialogTitle>
                <DialogContent>
                    {following.map((user) => (
                        <Box key={user.id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ mr: 2 }}>{user.username.charAt(0).toUpperCase()}</Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body1">{user.full_name || user.username}</Typography>
                                <Typography variant="body2" color="text.secondary">@{user.username}</Typography>
                            </Box>
                            <Button 
                                size="small" 
                                onClick={() => {
                                    setShowFollowing(false);
                                    navigate(`/profile/${user.username}`);
                                }}
                            >
                                View
                            </Button>
                        </Box>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowFollowing(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default UserProfile;
