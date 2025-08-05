const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const router = express.Router();

// Get chat session or create new one
router.post('/session', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Check if user has existing active session
    let existingSession = await db.chatSessions.findOne({ 
      userId, 
      active: true 
    });

    if (existingSession) {
      // Update last activity
      await db.chatSessions.update(
        { _id: existingSession._id },
        { $set: { lastActivity: new Date().toISOString() } }
      );
      
      return res.json({
        sessionId: existingSession.id,
        session: existingSession
      });
    }

    // Create new session
    const sessionId = uuidv4();
    const newSession = {
      id: sessionId,
      userId,
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      active: true,
      messageCount: 0
    };
    
    await db.chatSessions.insert(newSession);

    res.json({
      sessionId,
      session: newSession
    });

  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get chat history for a session
router.get('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Check if session exists
    const session = await db.chatSessions.findOne({ id: sessionId });
    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    const messages = await db.chatMessages.find({ sessionId })
      .sort({ timestamp: 1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const totalCount = await db.chatMessages.count({ sessionId });

    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      message: msg.message,
      sender: msg.sender,
      timestamp: msg.timestamp,
      resources: msg.resources,
      moodCheck: msg.moodCheck
    }));

    res.json({
      messages: formattedMessages,
      total: totalCount,
      sessionId
    });

  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Save a message to chat history
router.post('/message', async (req, res) => {
  try {
    const { sessionId, message, sender, resources, moodCheck } = req.body;

    if (!sessionId || !message || !sender) {
      return res.status(400).json({ message: 'Session ID, message, and sender are required' });
    }

    // Check if session exists
    const session = await db.chatSessions.findOne({ id: sessionId });
    if (!session) {
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

    // Save message to database
    await db.chatMessages.insert(messageObj);

    // Update session activity and message count
    await db.chatSessions.update(
      { id: sessionId },
      { 
        $set: { lastActivity: new Date().toISOString() },
        $inc: { messageCount: 1 }
      }
    );

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
router.put('/session/:sessionId/end', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await db.chatSessions.findOne({ id: sessionId });
    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    // Update session to inactive
    const updatedSession = await db.chatSessions.update(
      { id: sessionId },
      { 
        $set: { 
          active: false,
          endTime: new Date().toISOString()
        }
      },
      { returnUpdatedDocs: true }
    );

    res.json({
      message: 'Chat session ended successfully',
      session: updatedSession
    });

  } catch (error) {
    console.error('Session end error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's chat sessions
router.get('/sessions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { active, limit = 10 } = req.query;

    let query = { userId };
    if (active !== undefined) {
      query.active = active === 'true';
    }

    const sessions = await db.chatSessions.find(query)
      .sort({ startTime: -1 })
      .limit(parseInt(limit));

    // Add message count for each session
    const sessionsWithMessageCount = await Promise.all(
      sessions.map(async (session) => {
        const messageCount = await db.chatMessages.count({ sessionId: session.id });
        return {
          ...session,
          messageCount
        };
      })
    );

    const totalCount = await db.chatSessions.count({ userId });

    res.json({
      sessions: sessionsWithMessageCount,
      total: totalCount
    });

  } catch (error) {
    console.error('User sessions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get chat analytics for a user
router.get('/analytics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    // Get sessions within date range
    const sessions = await db.chatSessions.find({
      userId,
      startTime: { $gte: cutoffDate.toISOString() }
    });

    let totalSessions = sessions.length;
    let activeSessions = sessions.filter(s => s.active).length;
    let totalMessages = 0;
    let averageSessionLength = 0;
    const moodTrends = [];

    // Calculate analytics
    for (const session of sessions) {
      const messages = await db.chatMessages.find({ sessionId: session.id });
      totalMessages += messages.length;

      // Calculate session length
      const sessionStart = new Date(session.startTime);
      const sessionEnd = session.endTime ? new Date(session.endTime) : new Date(session.lastActivity);
      const sessionLength = (sessionEnd - sessionStart) / (1000 * 60); // in minutes
      averageSessionLength += sessionLength;

      // Extract mood data
      const moodRatings = await db.moodRatings.find({ sessionId: session.id });
      moodRatings.forEach(rating => {
        moodTrends.push({
          date: rating.timestamp.split('T')[0],
          mood: rating.moodRating
        });
      });
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
router.post('/mood', async (req, res) => {
  try {
    const { sessionId, userId, moodRating, notes } = req.body;

    if (!sessionId || !userId || moodRating === undefined) {
      return res.status(400).json({ message: 'Session ID, User ID, and mood rating are required' });
    }

    if (moodRating < 1 || moodRating > 10) {
      return res.status(400).json({ message: 'Mood rating must be between 1 and 10' });
    }

    // Save mood entry to database
    const moodEntry = {
      id: uuidv4(),
      sessionId,
      userId,
      moodRating,
      notes: notes || '',
      timestamp: new Date().toISOString()
    };

    await db.moodRatings.insert(moodEntry);

    // Also add to chat messages as a special message type
    const moodMessage = {
      id: uuidv4(),
      sessionId,
      message: `Mood rating: ${moodRating}/10${notes ? ` - ${notes}` : ''}`,
      sender: 'user',
      timestamp: new Date().toISOString(),
      moodRating,
      type: 'mood_entry'
    };

    await db.chatMessages.insert(moodMessage);

    // Update session activity
    await db.chatSessions.update(
      { id: sessionId },
      { 
        $set: { lastActivity: new Date().toISOString() },
        $inc: { messageCount: 1 }
      }
    );

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