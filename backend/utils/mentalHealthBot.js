class MentalHealthBot {
  constructor() {
    this.sessions = new Map(); // Store user sessions
    this.initializeResponses();
  }

  initializeResponses() {
    this.greetings = [
      "Hello! I'm here to support your mental wellness. How are you feeling today?",
      "Hi there! I'm your mental health support companion. What's on your mind?",
      "Welcome! I'm here to listen and help with your mental wellbeing. How can I assist you?"
    ];

    this.positiveResponses = [
      "That's wonderful to hear! It's great that you're feeling positive.",
      "I'm so glad you're doing well! Keep up the positive energy.",
      "That sounds fantastic! Positive feelings are so important for our wellbeing."
    ];

    this.supportiveResponses = [
      "I hear you, and I want you to know that your feelings are valid.",
      "Thank you for sharing that with me. It takes courage to open up.",
      "I'm here to listen and support you through this."
    ];

    this.stressResponses = [
      "Stress can be overwhelming. Let's work through some strategies together.",
      "It sounds like you're dealing with a lot right now. Remember, it's okay to take breaks.",
      "Stress is a normal response, but we can find ways to manage it better."
    ];

    this.anxietyResponses = [
      "Anxiety can feel very intense. Let's try some grounding techniques.",
      "I understand anxiety can be frightening. You're not alone in this.",
      "Anxiety is treatable and manageable. Let's explore some coping strategies."
    ];

    this.depressionResponses = [
      "Depression can make everything feel heavy. Small steps count, and I'm here with you.",
      "Thank you for trusting me with how you're feeling. Every day you're here matters.",
      "Depression affects many people. You've taken a positive step by reaching out."
    ];

    this.copingStrategies = {
      stress: [
        "Try the 4-7-8 breathing technique: Inhale for 4, hold for 7, exhale for 8",
        "Take a 5-minute walk or do some light stretching",
        "Practice progressive muscle relaxation",
        "Write down three things you're grateful for today"
      ],
      anxiety: [
        "Use the 5-4-3-2-1 grounding technique: 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste",
        "Try box breathing: Inhale for 4, hold for 4, exhale for 4, hold for 4",
        "Challenge anxious thoughts by asking: 'Is this thought helpful or realistic?'",
        "Practice mindfulness meditation for 5-10 minutes"
      ],
      depression: [
        "Set one small, achievable goal for today",
        "Reach out to a trusted friend or family member",
        "Spend 10 minutes outside in natural light",
        "Do one small act of self-care, like taking a warm shower or drinking your favorite tea"
      ]
    };

    this.resources = {
      crisis: {
        title: "Crisis Support",
        items: [
          { name: "National Suicide Prevention Lifeline", contact: "988" },
          { name: "Crisis Text Line", contact: "Text HOME to 741741" },
          { name: "Emergency Services", contact: "911" }
        ]
      },
      professional: {
        title: "Professional Help",
        items: [
          { name: "Employee Assistance Program (EAP)", contact: "Contact HR for details" },
          { name: "Psychology Today Therapist Finder", contact: "psychologytoday.com" },
          { name: "BetterHelp Online Therapy", contact: "betterhelp.com" }
        ]
      },
      wellness: {
        title: "Wellness Resources",
        items: [
          { name: "Headspace - Meditation App", contact: "headspace.com" },
          { name: "Calm - Sleep & Meditation", contact: "calm.com" },
          { name: "NAMI - Mental Health Education", contact: "nami.org" }
        ]
      }
    };
  }

  async processMessage(message, userId, sessionId) {
    // Initialize or get user session
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, {
        sessionId,
        conversationHistory: [],
        mood: null,
        riskLevel: 'low'
      });
    }

    const session = this.sessions.get(userId);
    session.conversationHistory.push({ message, timestamp: new Date() });

    // Analyze message sentiment and keywords
    const analysis = this.analyzeMessage(message);
    session.mood = analysis.mood;
    session.riskLevel = analysis.riskLevel;

    // Generate response based on analysis
    const response = this.generateResponse(analysis, session);

    return response;
  }

  analyzeMessage(message) {
    const lowerMessage = message.toLowerCase();
    
    // Crisis keywords
    const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'not worth living', 'better off dead'];
    const isCrisis = crisisKeywords.some(keyword => lowerMessage.includes(keyword));

    // Emotion keywords
    const anxietyKeywords = ['anxious', 'worried', 'panic', 'nervous', 'scared', 'afraid'];
    const depressionKeywords = ['depressed', 'sad', 'hopeless', 'empty', 'worthless', 'lonely'];
    const stressKeywords = ['stressed', 'overwhelmed', 'pressure', 'exhausted', 'burned out'];
    const positiveKeywords = ['happy', 'good', 'great', 'excited', 'grateful', 'better'];

    // Greeting keywords
    const greetingKeywords = ['hello', 'hi', 'hey', 'good morning', 'good afternoon'];
    const isGreeting = greetingKeywords.some(keyword => lowerMessage.includes(keyword));

    let mood = 'neutral';
    let riskLevel = 'low';
    let category = 'general';

    if (isCrisis) {
      mood = 'crisis';
      riskLevel = 'high';
      category = 'crisis';
    } else if (anxietyKeywords.some(keyword => lowerMessage.includes(keyword))) {
      mood = 'anxious';
      riskLevel = 'medium';
      category = 'anxiety';
    } else if (depressionKeywords.some(keyword => lowerMessage.includes(keyword))) {
      mood = 'depressed';
      riskLevel = 'medium';
      category = 'depression';
    } else if (stressKeywords.some(keyword => lowerMessage.includes(keyword))) {
      mood = 'stressed';
      riskLevel = 'medium';
      category = 'stress';
    } else if (positiveKeywords.some(keyword => lowerMessage.includes(keyword))) {
      mood = 'positive';
      category = 'positive';
    } else if (isGreeting) {
      category = 'greeting';
    }

    return { mood, riskLevel, category, isGreeting };
  }

  generateResponse(analysis, session) {
    let message = '';
    let resources = null;
    let moodCheck = null;

    switch (analysis.category) {
      case 'greeting':
        message = this.getRandomResponse(this.greetings);
        break;
      
      case 'crisis':
        message = "I'm very concerned about what you've shared. Your life has value and there are people who want to help. Please reach out to a crisis helpline immediately.";
        resources = this.resources.crisis;
        break;
      
      case 'anxiety':
        message = this.getRandomResponse(this.anxietyResponses);
        message += ` Here's a technique that might help: ${this.getRandomResponse(this.copingStrategies.anxiety)}`;
        resources = this.resources.wellness;
        break;
      
      case 'depression':
        message = this.getRandomResponse(this.depressionResponses);
        message += ` Let's try this: ${this.getRandomResponse(this.copingStrategies.depression)}`;
        resources = this.resources.professional;
        break;
      
      case 'stress':
        message = this.getRandomResponse(this.stressResponses);
        message += ` Try this technique: ${this.getRandomResponse(this.copingStrategies.stress)}`;
        break;
      
      case 'positive':
        message = this.getRandomResponse(this.positiveResponses);
        break;
      
      default:
        message = this.getRandomResponse(this.supportiveResponses);
        message += " Can you tell me more about how you're feeling? I'm here to listen.";
    }

    // Add mood check for medium/high risk
    if (analysis.riskLevel !== 'low') {
      moodCheck = {
        question: "On a scale of 1-10, how would you rate your current mood?",
        scale: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      };
    }

    return { message, resources, moodCheck };
  }

  getRandomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Get user session for analytics
  getUserSession(userId) {
    return this.sessions.get(userId);
  }

  // Clear old sessions (run periodically)
  clearOldSessions() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    for (const [userId, session] of this.sessions.entries()) {
      const lastActivity = session.conversationHistory[session.conversationHistory.length - 1]?.timestamp;
      if (lastActivity && lastActivity < oneDayAgo) {
        this.sessions.delete(userId);
      }
    }
  }
}

module.exports = MentalHealthBot; 