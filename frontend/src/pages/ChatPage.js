import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Avatar,
  Divider,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Send as SendIcon,
  Psychology as BotIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Phone as PhoneIcon,
  Link as LinkIcon,
  MoodBad as MoodIcon,
} from '@mui/icons-material';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';

const ChatPage = () => {
  const [message, setMessage] = useState('');
  const { messages, sendMessage, clearMessages, submitMoodRating, isTyping } = useChat();
  const messagesEndRef = useRef(null);
  const [showMoodRating, setShowMoodRating] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message;
    setMessage('');

    try {
      await sendMessage(userMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleMoodRating = async (rating, messageIndex) => {
    try {
      await submitMoodRating(rating, '');
      setShowMoodRating(messageIndex); // Hide the mood check for this message
      
      // Send a message confirming the mood rating
      await sendMessage(`I rated my mood as ${rating}/10`);
    } catch (error) {
      console.error('Error submitting mood rating:', error);
    }
  };

  const handleClearChat = () => {
    clearMessages();
  };

  return (
    <Box sx={{ 
      height: 'calc(100vh - 100px)', 
      display: 'flex', 
      flexDirection: 'column',
      maxWidth: '800px',
      mx: 'auto',
      p: 2
    }}>
      {/* Header */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <BotIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">
                  Mental Health Assistant
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  I'm here to support your mental wellness journey
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handleClearChat} title="Clear Chat">
              <RefreshIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      {/* Messages Container */}
      <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: 1, overflow: 'hidden', p: 0 }}>
          <Box 
            sx={{ 
              height: '100%', 
              overflowY: 'auto', 
              p: 2,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {messages.length === 0 && (
              <Box sx={{ 
                textAlign: 'center', 
                py: 4,
                color: 'text.secondary'
              }}>
                <BotIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" gutterBottom>
                  Welcome to your Mental Health Chat
                </Typography>
                <Typography variant="body2">
                  Start a conversation by typing a message below. I'm here to listen and support you.
                </Typography>
                <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Chip 
                    label="How are you feeling?" 
                    variant="outlined" 
                    onClick={() => setMessage("How are you feeling?")}
                    clickable
                  />
                  <Chip 
                    label="I'm feeling stressed" 
                    variant="outlined" 
                    onClick={() => setMessage("I'm feeling stressed")}
                    clickable
                  />
                  <Chip 
                    label="Tell me about anxiety" 
                    variant="outlined" 
                    onClick={() => setMessage("Tell me about anxiety")}
                    clickable
                  />
                </Box>
              </Box>
            )}

            {messages.map((msg, index) => (
              <Box key={index}>
                <Box
                  sx={{
                    display: 'flex',
                    mb: 2,
                    alignItems: 'flex-start',
                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  {msg.sender === 'bot' && (
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2, mt: 0.5 }}>
                      <BotIcon />
                    </Avatar>
                  )}
                  
                  <Box sx={{ maxWidth: '70%' }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: msg.sender === 'user' ? 'primary.main' : 'grey.100',
                        color: msg.sender === 'user' ? 'white' : 'text.primary',
                        mb: 1,
                      }}
                    >
                      <Typography variant="body1">
                        {msg.text}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          opacity: 0.7, 
                          display: 'block', 
                          mt: 0.5 
                        }}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Box>

                    {/* Resources Section */}
                    {msg.resources && msg.sender === 'bot' && (
                      <Card sx={{ mt: 1, border: '1px solid', borderColor: 'primary.main' }}>
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="h6" color="primary" gutterBottom>
                            {msg.resources.title}
                          </Typography>
                          {msg.resources.items.map((item, idx) => (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              {item.contact.includes('http') ? <LinkIcon sx={{ mr: 1, fontSize: 18 }} /> : <PhoneIcon sx={{ mr: 1, fontSize: 18 }} />}
                              <Typography variant="body2">
                                <strong>{item.name}:</strong> {item.contact}
                              </Typography>
                            </Box>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* Mood Check Section */}
                    {msg.moodCheck && msg.sender === 'bot' && showMoodRating !== index && (
                      <Card sx={{ mt: 1, border: '1px solid', borderColor: 'secondary.main' }}>
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <MoodIcon sx={{ mr: 1, color: 'secondary.main' }} />
                            <Typography variant="body2" color="secondary.main">
                              {msg.moodCheck.question}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {msg.moodCheck.scale.map((rating) => (
                              <Button
                                key={rating}
                                variant="outlined"
                                size="small"
                                onClick={() => handleMoodRating(rating, index)}
                                sx={{ minWidth: 40 }}
                              >
                                {rating}
                              </Button>
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    )}
                  </Box>

                  {msg.sender === 'user' && (
                    <Avatar sx={{ bgcolor: 'secondary.main', ml: 2, mt: 0.5 }}>
                      <PersonIcon />
                    </Avatar>
                  )}
                </Box>
              </Box>
            ))}

            {isTyping && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <BotIcon />
                </Avatar>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'grey.100',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Typing...
                  </Typography>
                </Box>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>
        </CardContent>

        <Divider />
        
        {/* Message Input */}
        <CardContent sx={{ p: 2 }}>
          <Box 
            component="form" 
            onSubmit={handleSendMessage}
            sx={{ display: 'flex', gap: 1 }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isTyping}
              multiline
              maxRows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={!message.trim() || isTyping}
              sx={{ 
                minWidth: 56,
                borderRadius: 3,
              }}
            >
              <SendIcon />
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ChatPage; 