const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// In-memory storage for chat sessions and messages
const chatSessions = new Map();
const chatMessages = new Map();

// Get chat session or create new one
router.post('/session', (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Check if user has existing active session
    let sessionId = null;
    for (const [id, session] of chatSessions.entries()) {
      if (session.userId === userId && session.active) {
        sessionId = id;
        break;
      }
    }

    // Create new session if none exists
    if (!sessionId) {
      sessionId = uuidv4();
      chatSessions.set(sessionId, {
        id: sessionId,
        userId,
        startTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        active: true,
        messageCount: 0
      });
      
      // Initialize message history for this session
      chatMessages.set(sessionId, []);
    }

    res.json({
      sessionId,
      session: chatSessions.get(sessionId)
    });

  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get chat history for a session
router.get('/history/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    if (!chatMessages.has(sessionId)) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    const messages = chatMessages.get(sessionId);
    const paginatedMessages = messages
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
      .map(msg => ({
        id: msg.id,
        message: msg.message,
        sender: msg.sender,
        timestamp: msg.timestamp,
        resources: msg.resources,
        moodCheck: msg.moodCheck
      }));

    res.json({
      messages: paginatedMessages,
      total: messages.length,
      sessionId
    });

  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Save a message to chat history
router.post('/message', (req, res) => {
  try {
    const { sessionId, message, sender, resources, moodCheck } = req.body;

    if (!sessionId || !message || !sender) {
      return res.status(400).json({ message: 'Session ID, message, and sender are required' });
    }

    // Check if session exists
    if (!chatSessions.has(sessionId)) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    // Create message object
    const messageObj = {
      id: uuidv4(),
      sessionId,
      message,
      sender, // 'user' or 'bot'
      timestamp: new Date().toISOString(),
      resources: resources || null,
      moodCheck: moodCheck || null
    };

    // Add message to history
    if (!chatMessages.has(sessionId)) {
      chatMessages.set(sessionId, []);
    }
    chatMessages.get(sessionId).push(messageObj);

    // Update session activity
    const session = chatSessions.get(sessionId);
    session.lastActivity = new Date().toISOString();
    session.messageCount += 1;

    res.status(201).json({
      message: 'Message saved successfully',
      messageId: messageObj.id
    });

  } catch (error) {
    console.error('Message save error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// End chat session
router.put('/session/:sessionId/end', (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!chatSessions.has(sessionId)) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    const session = chatSessions.get(sessionId);
    session.active = false;
    session.endTime = new Date().toISOString();

    res.json({
      message: 'Chat session ended successfully',
      session
    });

  } catch (error) {
    console.error('Session end error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's chat sessions
router.get('/sessions/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { active, limit = 10 } = req.query;

    const userSessions = [];
    for (const [sessionId, session] of chatSessions.entries()) {
      if (session.userId === userId) {
        if (active === undefined || session.active === (active === 'true')) {
          userSessions.push({
            ...session,
            messageCount: chatMessages.has(sessionId) ? chatMessages.get(sessionId).length : 0
          });
        }
      }
    }

    // Sort by most recent first
    userSessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    
    // Apply limit
    const limitedSessions = userSessions.slice(0, parseInt(limit));

    res.json({
      sessions: limitedSessions,
      total: userSessions.length
    });

  } catch (error) {
    console.error('User sessions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get chat analytics for a user
router.get('/analytics/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    let totalSessions = 0;
    let totalMessages = 0;
    let activeSessions = 0;
    let averageSessionLength = 0;
    const moodTrends = [];

    for (const [sessionId, session] of chatSessions.entries()) {
      if (session.userId === userId && new Date(session.startTime) >= cutoffDate) {
        totalSessions++;
        if (session.active) activeSessions++;

        if (chatMessages.has(sessionId)) {
          const messages = chatMessages.get(sessionId);
          totalMessages += messages.length;

          // Calculate session length
          const sessionStart = new Date(session.startTime);
          const sessionEnd = session.endTime ? new Date(session.endTime) : new Date(session.lastActivity);
          const sessionLength = (sessionEnd - sessionStart) / (1000 * 60); // in minutes
          averageSessionLength += sessionLength;

          // Extract mood data
          messages.forEach(msg => {
            if (msg.moodCheck && msg.sender === 'user') {
              moodTrends.push({
                date: msg.timestamp.split('T')[0],
                mood: msg.moodRating || null
              });
            }
          });
        }
      }
    }

    averageSessionLength = totalSessions > 0 ? averageSessionLength / totalSessions : 0;

    res.json({
      analytics: {
        totalSessions,
        activeSessions,
        totalMessages,
        averageSessionLength: Math.round(averageSessionLength * 100) / 100,
        averageMessagesPerSession: totalSessions > 0 ? Math.round((totalMessages / totalSessions) * 100) / 100 : 0,
        moodTrends
      },
      period: `${days} days`
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Test bot response (for development/testing)
router.post('/bot-response', async (req, res) => {
  try {
    const { message, userId, sessionId } = req.body;

    if (!message || !userId || !sessionId) {
      return res.status(400).json({ message: 'Message, userId, and sessionId are required' });
    }

    // Import and initialize bot
    const MentalHealthBot = require('../utils/mentalHealthBot');
    const bot = new MentalHealthBot();

    // Get bot response
    const botResponse = await bot.processMessage(message, userId, sessionId);

    res.json({
      userMessage: message,
      botResponse: {
        text: botResponse.message,
        resources: botResponse.resources,
        moodCheck: botResponse.moodCheck
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Bot response error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Submit mood rating
router.post('/mood', (req, res) => {
  try {
    const { sessionId, userId, moodRating, notes } = req.body;

    if (!sessionId || !userId || moodRating === undefined) {
      return res.status(400).json({ message: 'Session ID, User ID, and mood rating are required' });
    }

    if (moodRating < 1 || moodRating > 10) {
      return res.status(400).json({ message: 'Mood rating must be between 1 and 10' });
    }

    // Save mood entry
    const moodEntry = {
      id: uuidv4(),
      sessionId,
      userId,
      moodRating,
      notes: notes || '',
      timestamp: new Date().toISOString()
    };

    // Add to session messages as a special message type
    if (chatMessages.has(sessionId)) {
      chatMessages.get(sessionId).push({
        id: uuidv4(),
        sessionId,
        message: `Mood rating: ${moodRating}/10${notes ? ` - ${notes}` : ''}`,
        sender: 'user',
        timestamp: new Date().toISOString(),
        moodRating,
        type: 'mood_entry'
      });
    }

    res.status(201).json({
      message: 'Mood rating saved successfully',
      moodEntry
    });

  } catch (error) {
    console.error('Mood rating error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 