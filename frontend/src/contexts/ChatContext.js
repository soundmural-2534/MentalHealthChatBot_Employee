import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user, sessionId } = useAuth();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentChatSession, setCurrentChatSession] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    if (user && sessionId) {
      const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          userId: user.id,
          sessionId
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        maxReconnectionAttempts: 5
      });

      setSocket(newSocket);

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('Connected to chat server');
        setIsConnected(true);
        newSocket.emit('join_room', { userId: user.id });
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from chat server');
        setIsConnected(false);
      });

      newSocket.on('joined_room', (data) => {
        console.log('Joined chat room:', data.message);
      });

      // Message event handlers
      newSocket.on('receive_message', (messageData) => {
        setMessages(prev => [...prev, messageData]);
      });

      // Bot typing indicator
      newSocket.on('bot_typing', (data) => {
        setIsTyping(data.typing);
      });

      newSocket.on('chat_error', (error) => {
        toast.error(error.message);
        setIsTyping(false);
      });

      // Connection error handling
      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        toast.error('Connection error. Please check your internet connection.');
      });

      return () => {
        newSocket.close();
      };
    }
  }, [user, sessionId]); // Removed saveChatMessage from dependencies to avoid circular dependency

  // Load chat history
  const loadChatHistory = useCallback(async (chatSessionId) => {
    if (!chatSessionId) return;

    try {
      const response = await axios.get(`/chat/history/${chatSessionId}`);
      const historyMessages = response.data.messages;
      setMessages(historyMessages);
      setChatHistory(historyMessages);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      // Don't show error toast for history loading as it's not critical
    }
  }, []);

  // Create or get chat session
  const initializeChatSession = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await axios.post('/chat/session', { userId: user.id });
      setCurrentChatSession(response.data);
      
      // Load chat history for this session
      await loadChatHistory(response.data.sessionId);
    } catch (error) {
      console.error('Failed to initialize chat session:', error);
      toast.error('Failed to start chat session');
    } finally {
      setLoading(false);
    }
  }, [user, loadChatHistory]);

  // Save message to backend
  const saveChatMessage = useCallback(async (messageData) => {
    if (!currentChatSession) return;

    try {
      await axios.post('/chat/message', {
        sessionId: currentChatSession.sessionId,
        message: messageData.text || messageData.message || '', // Handle both formats with fallback
        sender: messageData.sender,
        resources: messageData.resources || null,
        moodCheck: messageData.moodCheck || null
      });
    } catch (error) {
      console.error('Failed to save message:', error);
      // Don't show error toast as this is background operation
    }
  }, [currentChatSession]);

  // Effect to save bot messages when they arrive
  useEffect(() => {
    if (messages.length > 0 && currentChatSession) {
      const lastMessage = messages[messages.length - 1];
      // Only save bot messages automatically (user messages are saved in sendMessage)
      if (lastMessage.sender === 'bot' && !lastMessage.saved) {
        saveChatMessage(lastMessage);
        // Mark message as saved to avoid duplicate saves
        setMessages(prev => 
          prev.map((msg, index) => 
            index === prev.length - 1 ? { ...msg, saved: true } : msg
          )
        );
      }
    }
  }, [messages, currentChatSession, saveChatMessage]);

  // Send message
  const sendMessage = useCallback(async (messageText) => {
    if (!socket || !user || !currentChatSession || !messageText.trim()) {
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    // Add user message to UI immediately
    setMessages(prev => [...prev, userMessage]);

    // Save user message
    await saveChatMessage(userMessage);

    // Send message to bot via socket
    socket.emit('send_message', {
      message: messageText,
      userId: user.id,
      sessionId: currentChatSession.sessionId
    });
  }, [socket, user, currentChatSession, saveChatMessage]);

  // Submit mood rating
  const submitMoodRating = useCallback(async (rating, notes = '') => {
    if (!user || !currentChatSession) return;

    try {
      await axios.post('/chat/mood', {
        sessionId: currentChatSession.sessionId,
        userId: user.id,
        moodRating: rating,
        notes
      });

      toast.success('Thank you for sharing your mood rating!');
      return { success: true };
    } catch (error) {
      console.error('Failed to submit mood rating:', error);
      toast.error('Failed to submit mood rating');
      return { success: false };
    }
  }, [user, currentChatSession]);

  // Get user's chat sessions
  const getChatSessions = useCallback(async () => {
    if (!user) return [];

    try {
      const response = await axios.get(`/chat/sessions/${user.id}`);
      return response.data.sessions;
    } catch (error) {
      console.error('Failed to get chat sessions:', error);
      return [];
    }
  }, [user]);

  // Get analytics
  const getChatAnalytics = useCallback(async (days = 30) => {
    if (!user) return null;

    try {
      const response = await axios.get(`/chat/analytics/${user.id}?days=${days}`);
      return response.data.analytics;
    } catch (error) {
      console.error('Failed to get analytics:', error);
      return null;
    }
  }, [user]);

  // End chat session
  const endChatSession = useCallback(async () => {
    if (!currentChatSession) return;

    try {
      await axios.put(`/chat/session/${currentChatSession.sessionId}/end`);
      setCurrentChatSession(null);
      setMessages([]);
      toast.success('Chat session ended');
    } catch (error) {
      console.error('Failed to end chat session:', error);
      toast.error('Failed to end chat session');
    }
  }, [currentChatSession]);

  // Clear messages (for UI)
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Initialize chat session when user logs in
  useEffect(() => {
    if (user && !currentChatSession) {
      initializeChatSession();
    }
  }, [user, currentChatSession, initializeChatSession]);

  const value = {
    // Connection state
    isConnected,
    loading,
    isTyping,
    
    // Messages and sessions
    messages,
    chatHistory,
    currentChatSession,
    
    // Actions
    sendMessage,
    submitMoodRating,
    getChatSessions,
    getChatAnalytics,
    endChatSession,
    clearMessages,
    initializeChatSession,
    loadChatHistory,
    
    // Computed values
    hasActiveSession: !!currentChatSession,
    messageCount: messages.length
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}; 