import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Rating,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Add as AddIcon,
  Insights,
  History,
  Analytics,
  EmojiEmotions,
  SentimentVeryDissatisfied,
  SentimentDissatisfied,
  SentimentNeutral,
  SentimentSatisfied,
  SentimentVerySatisfied,
  Close as CloseIcon,
  DateRange,
  BarChart,
  Timeline
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import axios from 'axios';
import toast from 'react-hot-toast';

const MoodTrackingPage = () => {
  const { user } = useAuth();
  const { submitMoodRating } = useChat();
  
  const [currentTab, setCurrentTab] = useState(0);
  const [moodHistory, setMoodHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddMood, setShowAddMood] = useState(false);
  const [newMoodData, setNewMoodData] = useState({
    rating: 5,
    emotion: '',
    notes: '',
    triggers: []
  });

  // Mood emotions with icons
  const moodEmotions = [
    { value: 'happy', label: 'Happy', icon: <SentimentVerySatisfied />, color: '#4caf50' },
    { value: 'content', label: 'Content', icon: <SentimentSatisfied />, color: '#8bc34a' },
    { value: 'neutral', label: 'Neutral', icon: <SentimentNeutral />, color: '#ffc107' },
    { value: 'sad', label: 'Sad', icon: <SentimentDissatisfied />, color: '#ff9800' },
    { value: 'anxious', label: 'Anxious', icon: <SentimentVeryDissatisfied />, color: '#f44336' },
    { value: 'angry', label: 'Angry', icon: <SentimentVeryDissatisfied />, color: '#e91e63' },
    { value: 'stressed', label: 'Stressed', icon: <SentimentDissatisfied />, color: '#ff5722' },
    { value: 'excited', label: 'Excited', icon: <SentimentVerySatisfied />, color: '#00bcd4' }
  ];

  // Common mood triggers
  const commonTriggers = [
    'Work', 'Family', 'Health', 'Money', 'Relationships', 'Sleep', 'Weather', 'Social'
  ];

  // Chart colors
  const chartColors = [
    '#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0', 
    '#00bcd4', '#8bc34a', '#ffc107', '#e91e63', '#795548'
  ];

  useEffect(() => {
    fetchMoodData();
  }, [user]);

  const fetchMoodData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch mood history
      const historyResponse = await axios.get(`/chat/mood-history/${user.id}`);
      setMoodHistory(historyResponse.data.moodHistory || []);
      
      // Fetch analytics
      const analyticsResponse = await axios.get(`/chat/mood-analytics/${user.id}`);
      setAnalytics(analyticsResponse.data);
      
    } catch (error) {
      console.error('Failed to fetch mood data:', error);
      toast.error('Failed to load mood data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMood = async () => {
    try {
      // Submit mood rating
      await axios.post('/chat/mood', {
        sessionId: 'mood-tracking-' + Date.now(), // Special session for direct mood entries
        userId: user.id,
        moodRating: newMoodData.rating,
        notes: newMoodData.notes,
        emotion: newMoodData.emotion,
        triggers: newMoodData.triggers
      });

      toast.success('Mood entry added successfully!');
      setShowAddMood(false);
      setNewMoodData({ rating: 5, emotion: '', notes: '', triggers: [] });
      fetchMoodData(); // Refresh data
    } catch (error) {
      console.error('Failed to add mood entry:', error);
      toast.error('Failed to add mood entry');
    }
  };

  const getMoodInsights = () => {
    if (!moodHistory.length) return null;

    const recentMoods = moodHistory.slice(-7); // Last 7 entries
    const averageMood = recentMoods.reduce((sum, entry) => sum + entry.moodRating, 0) / recentMoods.length;
    const trend = recentMoods.length > 1 ? recentMoods[recentMoods.length - 1].moodRating - recentMoods[0].moodRating : 0;

    return {
      averageMood: Math.round(averageMood * 10) / 10,
      trend,
      totalEntries: moodHistory.length,
      streakDays: calculateStreak()
    };
  };

  const calculateStreak = () => {
    // Calculate consecutive days with mood entries
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = format(subDays(today, i), 'yyyy-MM-dd');
      const hasEntry = moodHistory.some(entry => 
        format(new Date(entry.timestamp), 'yyyy-MM-dd') === checkDate
      );
      
      if (hasEntry) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const prepareTrendData = () => {
    if (!moodHistory.length) return [];
    
    return moodHistory
      .slice(-30) // Last 30 entries
      .map(entry => ({
        date: format(new Date(entry.timestamp), 'MM/dd'),
        mood: entry.moodRating,
        emotion: entry.emotion
      }));
  };

  const prepareEmotionData = () => {
    if (!moodHistory.length) return [];
    
    const emotionCounts = {};
    moodHistory.forEach(entry => {
      if (entry.emotion) {
        emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
      }
    });

    return Object.entries(emotionCounts).map(([emotion, count]) => ({
      name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      value: count
    }));
  };

  const insights = getMoodInsights();
  const trendData = prepareTrendData();
  const emotionData = prepareEmotionData();

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>Loading mood data...</Typography>
          <LinearProgress sx={{ mt: 2 }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
              <EmojiEmotions sx={{ mr: 2, fontSize: 40 }} />
              Mood Tracking
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track and understand your emotional wellbeing over time
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowAddMood(true)}
            size="large"
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
              '&:hover': { transform: 'translateY(-2px)' }
            }}
          >
            Log Mood
          </Button>
        </Box>

        {/* Insights Cards */}
        {insights && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Average Mood</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {insights.averageMood}/10
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Last 7 entries
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Trend</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {insights.trend > 0 ? <TrendingUp /> : <TrendingDown />}
                    <Typography variant="h3" sx={{ fontWeight: 700, ml: 1 }}>
                      {insights.trend > 0 ? '+' : ''}{insights.trend.toFixed(1)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    vs. previous period
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Total Entries</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {insights.totalEntries}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Mood logs recorded
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Streak</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {insights.streakDays}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Consecutive days
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabs */}
        <Paper sx={{ borderRadius: 3, mb: 3 }}>
          <Tabs 
            value={currentTab} 
            onChange={(e, newValue) => setCurrentTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Trends" icon={<Timeline />} />
            <Tab label="Analytics" icon={<BarChart />} />
            <Tab label="History" icon={<History />} />
            <Tab label="Insights" icon={<Insights />} />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Trends Tab */}
            {currentTab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                  <Paper sx={{ p: 3, borderRadius: 3, height: 400 }}>
                    <Typography variant="h6" gutterBottom>
                      Mood Trend (Last 30 Days)
                    </Typography>
                    {trendData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="90%">
                        <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[1, 10]} />
                          <RechartsTooltip />
                          <Line 
                            type="monotone" 
                            dataKey="mood" 
                            stroke="#667eea" 
                            strokeWidth={3}
                            dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '90%' }}>
                        <Typography variant="body1" color="text.secondary">
                          No mood data available. Start logging your mood to see trends!
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
                
                <Grid item xs={12} lg={4}>
                  <Paper sx={{ p: 3, borderRadius: 3, height: 400 }}>
                    <Typography variant="h6" gutterBottom>
                      Emotion Distribution
                    </Typography>
                    {emotionData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                          <Pie
                            data={emotionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {emotionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '90%' }}>
                        <Typography variant="body1" color="text.secondary" textAlign="center">
                          No emotion data available
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            )}

            {/* Analytics Tab */}
            {currentTab === 1 && (
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Mood Analytics
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Analytics features coming soon...
                </Typography>
              </Paper>
            )}

            {/* History Tab */}
            {currentTab === 2 && (
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Mood History
                </Typography>
                {moodHistory.length > 0 ? (
                  <Grid container spacing={2}>
                    {moodHistory.slice().reverse().map((entry, index) => (
                      <Grid item xs={12} sm={6} md={4} key={entry.id || index}>
                        <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Chip 
                                label={`${entry.moodRating}/10`}
                                color={entry.moodRating >= 7 ? 'success' : entry.moodRating >= 4 ? 'warning' : 'error'}
                                size="small"
                              />
                              <Typography variant="caption" color="text.secondary">
                                {format(new Date(entry.timestamp), 'MMM dd, HH:mm')}
                              </Typography>
                            </Box>
                            {entry.emotion && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                {moodEmotions.find(e => e.value === entry.emotion)?.icon}
                                <Typography variant="body2" sx={{ ml: 1, textTransform: 'capitalize' }}>
                                  {entry.emotion}
                                </Typography>
                              </Box>
                            )}
                            {entry.notes && (
                              <Typography variant="body2" color="text.secondary">
                                {entry.notes}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Alert severity="info">
                    No mood entries yet. Start tracking your mood to build your history!
                  </Alert>
                )}
              </Paper>
            )}

            {/* Insights Tab */}
            {currentTab === 3 && (
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Mood Insights
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Personalized insights and recommendations coming soon...
                </Typography>
              </Paper>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Add Mood Dialog */}
        <Dialog 
          open={showAddMood} 
          onClose={() => setShowAddMood(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Log Your Mood
              <IconButton onClick={() => setShowAddMood(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              {/* Mood Rating */}
              <Typography variant="subtitle1" gutterBottom>
                How are you feeling? (1-10)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Rating
                  value={newMoodData.rating}
                  onChange={(e, newValue) => setNewMoodData(prev => ({ ...prev, rating: newValue || 1 }))}
                  max={10}
                  size="large"
                />
                <Typography variant="h6" sx={{ ml: 2 }}>
                  {newMoodData.rating}/10
                </Typography>
              </Box>

              {/* Emotion Selection */}
              <Typography variant="subtitle1" gutterBottom>
                Select an emotion (optional)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {moodEmotions.map((emotion) => (
                  <Chip
                    key={emotion.value}
                    icon={emotion.icon}
                    label={emotion.label}
                    variant={newMoodData.emotion === emotion.value ? 'filled' : 'outlined'}
                    onClick={() => setNewMoodData(prev => ({ 
                      ...prev, 
                      emotion: prev.emotion === emotion.value ? '' : emotion.value 
                    }))}
                    sx={{ 
                      borderColor: emotion.color,
                      color: newMoodData.emotion === emotion.value ? 'white' : emotion.color,
                      backgroundColor: newMoodData.emotion === emotion.value ? emotion.color : 'transparent',
                      '&:hover': { backgroundColor: emotion.color, color: 'white' }
                    }}
                  />
                ))}
              </Box>

              {/* Notes */}
              <TextField
                fullWidth
                label="Notes (optional)"
                multiline
                rows={3}
                value={newMoodData.notes}
                onChange={(e) => setNewMoodData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="What's on your mind? Any specific triggers or thoughts..."
                sx={{ mb: 2 }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setShowAddMood(false)}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleAddMood}
              sx={{ borderRadius: 2 }}
            >
              Save Mood Entry
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default MoodTrackingPage; 