import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Card,
    Alert,
    CircularProgress,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText
} from '@mui/material';
import {
    Activity as ActivityIcon,
    Book as BookIcon,
    Store as StoreIcon,
    Groups as GroupsIcon,
    Forum as ForumIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { getActivityFeed } from '../api';
import { useAuth } from '../context/AuthContext';

function ActivityFeed() {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        fetchActivity();
    }, []);

    const fetchActivity = async () => {
        setLoading(true);
        try {
            const response = await getActivityFeed(token);
            setActivities(response.data);
        } catch (err) {
            setError('Failed to load activity feed');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'create_club':
            case 'join_club':
                return <GroupsIcon />;
            case 'create_forum':
                return <ForumIcon />;
            case 'follow':
                return <PersonIcon />;
            default:
                return <BookIcon />;
        }
    };

    const getActivityText = (activity) => {
        const data = activity.activity_data;
        switch (activity.activity_type) {
            case 'create_club':
                return `created book club "${data.club_name}"`;
            case 'join_club':
                return `joined book club "${data.club_name}"`;
            case 'create_forum':
                return `started a discussion "${data.title}"`;
            case 'follow':
                return 'followed a new user';
            default:
                return activity.activity_type;
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
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <ActivityIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Typography variant="h4" component="h1">
                    Activity Feed
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            <List>
                {activities.length === 0 ? (
                    <Alert severity="info">No activity yet. Follow users to see their activity!</Alert>
                ) : (
                    activities.map((activity) => (
                        <Card key={activity.id} sx={{ mb: 2 }}>
                            <ListItem>
                                <ListItemAvatar>
                                    <Avatar>{activity.username.charAt(0).toUpperCase()}</Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Box>
                                            <Typography component="span" variant="subtitle2">
                                                {activity.full_name || activity.username}
                                            </Typography>
                                            {' '}
                                            <Typography component="span" variant="body2">
                                                {getActivityText(activity)}
                                            </Typography>
                                        </Box>
                                    }
                                    secondary={
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(activity.created_at).toLocaleString()}
                                        </Typography>
                                    }
                                />
                                {getActivityIcon(activity.activity_type)}
                            </ListItem>
                        </Card>
                    ))
                )}
            </List>
        </Container>
    );
}

export default ActivityFeed;
