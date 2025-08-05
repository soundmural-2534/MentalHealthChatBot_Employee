const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const resourcesRoutes = require('./routes/resources');
const MentalHealthBot = require('./utils/mentalHealthBot');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging and parsing middleware
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize mental health bot
const mentalHealthBot = new MentalHealthBot();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/resources', resourcesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Mental Health Chatbot API is running',
    timestamp: new Date().toISOString()
  });
});

// Import chat storage functions
const axios = require('axios');

// Helper function to save message to persistent storage
const saveMessageToDB = async (sessionId, message, sender, resources = null, moodCheck = null) => {
  try {
    // Use internal API call to save message
    await axios.post(`http://localhost:${process.env.PORT || 5000}/api/chat/message`, {
      sessionId,
      message,
      sender,
      resources,
      moodCheck
    });
    console.log('Message saved to database:', { sessionId, sender, message: message.substring(0, 50) + '...' });
  } catch (error) {
    console.error('Failed to save message to database:', error.message);
  }
};

// Socket.IO for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (data) => {
    socket.join(data.userId);
    console.log(`User ${data.userId} joined room`);
    
    // Send welcome message with initial greeting
    socket.emit('joined_room', { 
      message: 'Connected to Mental Health Support Chat',
      welcomeMessage: 'Hello! I\'m your mental health support assistant. How are you feeling today? I\'m here to listen and help you through whatever you\'re experiencing.'
    });
  });

  socket.on('send_message', async (data) => {
    try {
      const { message, userId, sessionId } = data;
      console.log(`Processing message from user ${userId}:`, message);
      
      // Save user message to database first
      await saveMessageToDB(sessionId, message, 'user');
      
      // Simulate typing delay for more realistic interaction
      socket.emit('bot_typing', { typing: true });
      
      // Add realistic delay (1-3 seconds based on message length)
      const typingDelay = Math.min(3000, Math.max(1000, message.length * 50));
      await new Promise(resolve => setTimeout(resolve, typingDelay));
      
      // Get bot response
      const botResponse = await mentalHealthBot.processMessage(message, userId, sessionId);
      
      // Stop typing indicator
      socket.emit('bot_typing', { typing: false });
      
      // Prepare bot message
      const botMessage = {
        id: uuidv4(),
        text: botResponse.message,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        resources: botResponse.resources || null,
        moodCheck: botResponse.moodCheck || null
      };
      
      // Save bot message to database
      await saveMessageToDB(
        sessionId, 
        botResponse.message, 
        'bot', 
        botResponse.resources, 
        botResponse.moodCheck
      );
      
      // Emit bot response to client
      socket.emit('receive_message', botMessage);
      
      // Log interaction for monitoring
      console.log(`Bot responded to user ${userId} with ${botResponse.message.length} character message`);
      
    } catch (error) {
      console.error('Chat error:', error);
      socket.emit('bot_typing', { typing: false });
      socket.emit('chat_error', { 
        message: 'I apologize, but I encountered a technical issue. Please try sending your message again.' 
      });
    }
  });

  // Handle mood rating submissions via socket
  socket.on('submit_mood_rating', async (data) => {
    try {
      const { rating, notes, userId, sessionId } = data;
      
      // Save mood rating to database
      await axios.post(`http://localhost:${process.env.PORT || 5000}/api/chat/mood`, {
        sessionId,
        userId,
        moodRating: rating,
        notes: notes || ''
      });
      
      // Send acknowledgment and follow-up response
      const followUpMessage = `Thank you for sharing that you're feeling ${rating}/10. ` +
        (rating <= 3 ? "I can see you're going through a difficult time. Remember that these feelings are temporary and you're not alone. Would you like to talk about what's making you feel this way?" :
         rating <= 6 ? "It sounds like you're having a mixed day. That's completely normal. Is there anything specific that's been on your mind?" :
         "I'm glad to hear you're feeling relatively positive today! What's been going well for you?");
      
      socket.emit('receive_message', {
        id: uuidv4(),
        text: followUpMessage,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        resources: null,
        moodCheck: null
      });
      
      // Save the follow-up message
      await saveMessageToDB(sessionId, followUpMessage, 'bot');
      
    } catch (error) {
      console.error('Mood rating error:', error);
      socket.emit('chat_error', { message: 'Failed to save mood rating. Please try again.' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 