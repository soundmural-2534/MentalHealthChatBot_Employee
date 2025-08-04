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

// Socket.IO for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (data) => {
    socket.join(data.userId);
    socket.emit('joined_room', { message: 'Connected to Mental Health Support Chat' });
  });

  socket.on('send_message', async (data) => {
    try {
      const { message, userId, sessionId } = data;
      
      // Simulate typing delay for more realistic interaction
      socket.emit('bot_typing', { typing: true });
      
      // Add realistic delay (1-3 seconds based on message length)
      const typingDelay = Math.min(3000, Math.max(1000, message.length * 50));
      await new Promise(resolve => setTimeout(resolve, typingDelay));
      
      // Get bot response
      const botResponse = await mentalHealthBot.processMessage(message, userId, sessionId);
      
      // Stop typing indicator
      socket.emit('bot_typing', { typing: false });
      
      // Emit bot response with proper format for frontend
      socket.emit('receive_message', {
        id: uuidv4(),
        text: botResponse.message,  // Changed from 'message' to 'text' to match frontend
        sender: 'bot',
        timestamp: new Date().toISOString(),
        resources: botResponse.resources || null,
        moodCheck: botResponse.moodCheck || null
      });
      
    } catch (error) {
      console.error('Chat error:', error);
      socket.emit('bot_typing', { typing: false });
      socket.emit('chat_error', { message: 'Sorry, I encountered an error. Please try again.' });
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
  console.log(`🚀 Mental Health Chatbot Server running on port ${PORT}`);
  console.log(`🏥 Health check available at http://localhost:${PORT}/api/health`);
}); 