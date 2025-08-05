class MentalHealthBot {
  constructor() {
    this.sessions = new Map(); // Store user sessions
    this.initializeResponses();
  }

  initializeResponses() {
    this.greetings = [
      "Hello! I'm here to support your mental wellness. How are you feeling today?",
      "Hi there! I'm your mental health support companion. What's on your mind?",
      "Welcome! I'm here to listen and help with your mental wellbeing. How can I assist you today?",
      "Good to see you! I'm here to provide a safe space for you to share your thoughts and feelings. What would you like to talk about?"
    ];

    this.positiveResponses = [
      "That's wonderful to hear! It's great that you're feeling positive. What's been contributing to these good feelings?",
      "I'm so glad you're doing well! Keep up the positive energy. Can you tell me more about what's been going right for you?",
      "That sounds fantastic! Positive feelings are so important for our wellbeing. What's been the highlight of your day or week?",
      "It's beautiful to hear such positivity from you! Sometimes it helps to acknowledge and celebrate these good moments. What made today special?"
    ];

    this.supportiveResponses = [
      "I hear you, and I want you to know that your feelings are completely valid. Can you tell me a bit more about what you're experiencing?",
      "Thank you for sharing that with me. It takes courage to open up. I'm here to listen - would you like to explore these feelings together?",
      "I'm here to listen and support you through this. Sometimes just talking about what we're going through can help. What's been weighing on your mind?",
      "Your feelings matter, and I'm glad you felt comfortable sharing with me. What's the most challenging part of what you're dealing with right now?"
    ];

    this.stressResponses = [
      "Stress can feel overwhelming, and it's completely understandable that you're feeling this way. What's been the main source of stress for you lately?",
      "It sounds like you're dealing with a lot right now. Remember, it's okay to take breaks and prioritize your wellbeing. What's been putting the most pressure on you?",
      "Stress is a normal response to challenging situations, but we can find ways to manage it better. Can you help me understand what's been stressing you out?",
      "I can hear that you're feeling stressed, and that must be really difficult. Sometimes breaking down what's causing stress can help us address it. What's been on your mind?"
    ];

    this.anxietyResponses = [
      "Anxiety can feel very intense and overwhelming. You're brave for reaching out. What does anxiety feel like for you, and when do you notice it most?",
      "I understand anxiety can be frightening and exhausting. You're not alone in this. Can you describe what situations or thoughts tend to trigger your anxiety?",
      "Anxiety affects many people, and it's treatable and manageable. What's been making you feel most anxious lately? Sometimes naming our fears can help reduce their power.",
      "Thank you for trusting me with your anxiety. It takes strength to acknowledge these feelings. What physical sensations or thoughts do you notice when you're anxious?"
    ];

    this.depressionResponses = [
      "Depression can make everything feel heavy and exhausting. I want you to know that small steps count, and I'm here with you. How long have you been feeling this way?",
      "Thank you for trusting me with how you're feeling. Every day you're here matters, and I'm glad you reached out. What does depression feel like for you day-to-day?",
      "Depression affects many people, and you've taken a positive step by reaching out. It can feel isolating, but you're not alone. What's been the hardest part for you?",
      "I hear the pain in what you're sharing, and I want you to know that these feelings, while very real and difficult, can improve with support. What's been going through your mind lately?"
    ];

    this.followUpQuestions = {
      stress: [
        "What time of day do you usually feel most stressed?",
        "Have you noticed any patterns in what triggers your stress?",
        "What normally helps you feel calmer during stressful times?",
        "Are there any upcoming situations that are particularly worrying you?"
      ],
      anxiety: [
        "What physical sensations do you notice when you're anxious?",
        "Are there specific situations that make your anxiety worse?",
        "Have you found anything that helps calm your anxiety, even a little?",
        "What thoughts tend to go through your mind when you're feeling anxious?"
      ],
      depression: [
        "What activities used to bring you joy that feel difficult now?",
        "How has your sleep and energy been lately?",
        "Do you have people in your life you feel comfortable talking to?",
        "What's one small thing that might make today a tiny bit easier?"
      ]
    };

    this.copingStrategies = {
      stress: [
        "Try the 4-7-8 breathing technique: Inhale for 4, hold for 7, exhale for 8. This activates your body's relaxation response.",
        "Take a 5-10 minute walk or do some light stretching. Movement can help release physical tension from stress.",
        "Practice the 'body scan' technique: Start from your toes and mentally check each part of your body, releasing tension as you go.",
        "Write down three things you're grateful for today, no matter how small. This can help shift your focus to positive aspects of your day."
      ],
      anxiety: [
        "Use the 5-4-3-2-1 grounding technique: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. This brings you back to the present moment.",
        "Try box breathing: Inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat this cycle to calm your nervous system.",
        "Challenge anxious thoughts by asking: 'Is this thought helpful? Is it realistic? What would I tell a friend having this thought?'",
        "Practice the 'STOP' technique: Stop what you're doing, Take a breath, Observe your thoughts and feelings, Proceed with intention."
      ],
      depression: [
        "Set one very small, achievable goal for today - even something as simple as making your bed or drinking a glass of water.",
        "Try to spend 10-15 minutes outside if possible. Natural light and fresh air can have a positive impact on mood.",
        "Reach out to one person - even a simple text to a friend or family member can help combat isolation.",
        "Do one small act of self-care, like taking a warm shower, listening to a favorite song, or drinking a cup of tea mindfully."
      ]
    };

    this.resources = {
      crisis: {
        title: "Immediate Crisis Support",
        items: [
          { name: "National Suicide Prevention Lifeline", contact: "988 (US)" },
          { name: "Crisis Text Line", contact: "Text HOME to 741741" },
          { name: "Emergency Services", contact: "911" },
          { name: "National Alliance on Mental Illness", contact: "1-800-950-NAMI (6264)" }
        ]
      },
      professional: {
        title: "Professional Mental Health Support",
        items: [
          { name: "Employee Assistance Program (EAP)", contact: "Contact HR for confidential support" },
          { name: "Psychology Today Therapist Finder", contact: "psychologytoday.com" },
          { name: "BetterHelp Online Therapy", contact: "betterhelp.com" },
          { name: "Talkspace Online Therapy", contact: "talkspace.com" }
        ]
      },
      wellness: {
        title: "Mental Wellness Resources",
        items: [
          { name: "Headspace - Meditation & Mindfulness", contact: "headspace.com" },
          { name: "Calm - Sleep & Meditation", contact: "calm.com" },
          { name: "NAMI - Mental Health Education", contact: "nami.org" },
          { name: "Anxiety and Depression Association", contact: "adaa.org" }
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
        riskLevel: 'low',
        lastCategory: null,
        consecutiveNegative: 0
      });
    }

    const session = this.sessions.get(userId);
    session.conversationHistory.push({ 
      message, 
      timestamp: new Date(),
      type: 'user_message'
    });

    // Analyze message sentiment and keywords
    const analysis = this.analyzeMessage(message);
    session.mood = analysis.mood;
    session.riskLevel = analysis.riskLevel;
    
    // Track consecutive negative interactions for enhanced support
    if (['crisis', 'anxiety', 'depression', 'stressed'].includes(analysis.category)) {
      session.consecutiveNegative++;
    } else {
      session.consecutiveNegative = 0;
    }
    
    session.lastCategory = analysis.category;

    // Generate response based on analysis and conversation history
    const response = this.generateResponse(analysis, session);

    // Add bot response to conversation history
    session.conversationHistory.push({
      message: response.message,
      timestamp: new Date(),
      type: 'bot_response',
      category: analysis.category
    });

    return response;
  }

  analyzeMessage(message) {
    const lowerMessage = message.toLowerCase();
    
    // Crisis keywords - highest priority
    const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'not worth living', 'better off dead', 'want to die', 'ending my life'];
    const isCrisis = crisisKeywords.some(keyword => lowerMessage.includes(keyword));

    // Emotion keywords - expanded for better detection
    const anxietyKeywords = ['anxious', 'worried', 'panic', 'nervous', 'scared', 'afraid', 'fear', 'terror', 'dread', 'catastrophic'];
    const depressionKeywords = ['depressed', 'sad', 'hopeless', 'empty', 'worthless', 'lonely', 'numb', 'lifeless', 'meaningless'];
    const stressKeywords = ['stressed', 'overwhelmed', 'pressure', 'exhausted', 'burned out', 'swamped', 'frazzled'];
    const positiveKeywords = ['happy', 'good', 'great', 'excited', 'grateful', 'better', 'wonderful', 'amazing', 'fantastic', 'joy'];

    // Greeting keywords
    const greetingKeywords = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
    const isGreeting = greetingKeywords.some(keyword => lowerMessage.includes(keyword)) && message.length < 30;

    // Help seeking keywords
    const helpKeywords = ['help', 'support', 'advice', 'guidance', 'don\'t know what to do'];
    const isSeekingHelp = helpKeywords.some(keyword => lowerMessage.includes(keyword));

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
    } else if (isSeekingHelp) {
      category = 'help_seeking';
    }

    return { mood, riskLevel, category, isGreeting, isSeekingHelp };
  }

  generateResponse(analysis, session) {
    let message = '';
    let resources = null;
    let moodCheck = null;

    // Check for patterns in conversation history
    const recentMessages = session.conversationHistory.slice(-3);
    const hasRepeatedCategory = recentMessages.filter(msg => 
      msg.type === 'bot_response' && msg.category === analysis.category
    ).length >= 2;

    switch (analysis.category) {
      case 'greeting':
        message = this.getRandomResponse(this.greetings);
        break;
      
      case 'crisis':
        message = "I'm very concerned about what you've shared, and I want you to know that your life has value and meaning. You deserve support and care. Please reach out to a crisis helpline immediately - they have trained professionals who can help you through this difficult time.";
        resources = this.resources.crisis;
        moodCheck = {
          question: "Before we continue, on a scale of 1-10, how safe do you feel right now?",
          scale: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        };
        break;
      
      case 'anxiety':
        if (hasRepeatedCategory) {
          message = "I notice we've been talking about anxiety for a while. Sometimes when anxiety persists, it can help to talk to a professional who specializes in anxiety disorders. " + 
                   this.getRandomResponse(this.copingStrategies.anxiety) + 
                   " " + this.getRandomResponse(this.followUpQuestions.anxiety);
          resources = this.resources.professional;
        } else {
          message = this.getRandomResponse(this.anxietyResponses) + 
                   " Here's a technique that might help right now: " + 
                   this.getRandomResponse(this.copingStrategies.anxiety);
        }
        break;
      
      case 'depression':
        if (session.consecutiveNegative >= 3) {
          message = "I'm noticing this has been a particularly difficult time for you. Depression can feel overwhelming, but professional support can make a real difference. " +
                   this.getRandomResponse(this.depressionResponses) + 
                   " Let's try this gentle approach: " + 
                   this.getRandomResponse(this.copingStrategies.depression);
          resources = this.resources.professional;
        } else {
          message = this.getRandomResponse(this.depressionResponses) + 
                   " Let's take this one step at a time: " + 
                   this.getRandomResponse(this.copingStrategies.depression);
        }
        break;
      
      case 'stress':
        message = this.getRandomResponse(this.stressResponses) + 
                 " Here's something you can try right now: " + 
                 this.getRandomResponse(this.copingStrategies.stress) + 
                 " " + this.getRandomResponse(this.followUpQuestions.stress);
        break;
      
      case 'positive':
        message = this.getRandomResponse(this.positiveResponses);
        break;
      
      case 'help_seeking':
        message = "I'm here to help and support you. Thank you for reaching out - that takes courage. " +
                 "Can you tell me more about what you're going through? Sometimes it helps to start with how you're feeling right now, and we can work through it together.";
        break;
      
      default:
        message = this.getRandomResponse(this.supportiveResponses);
        // Add contextual follow-up based on conversation history
        if (session.conversationHistory.length > 2) {
          message += " I notice this is something that's been on your mind. What feels most important to talk about right now?";
        }
    }

    // Add mood check for medium/high risk situations
    if (analysis.riskLevel !== 'low' && !moodCheck) {
      moodCheck = {
        question: "On a scale of 1-10, how would you rate your current emotional wellbeing?",
        scale: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      };
    }

    // Provide resources if consecutive negative interactions
    if (session.consecutiveNegative >= 2 && !resources && analysis.category !== 'positive') {
      resources = this.resources.wellness;
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

  // Enhanced session cleanup with better session management
  clearOldSessions() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    for (const [userId, session] of this.sessions.entries()) {
      const lastActivity = session.conversationHistory[session.conversationHistory.length - 1]?.timestamp;
      if (lastActivity && lastActivity < oneDayAgo) {
        console.log(`Cleaning up old session for user: ${userId}`);
        this.sessions.delete(userId);
      }
    }
  }

  // New method to get conversation insights
  getConversationInsights(userId) {
    const session = this.sessions.get(userId);
    if (!session) return null;

    const history = session.conversationHistory;
    const userMessages = history.filter(msg => msg.type === 'user_message');
    const categories = history.filter(msg => msg.type === 'bot_response').map(msg => msg.category);
    
    return {
      totalMessages: userMessages.length,
      dominantMood: session.mood,
      riskLevel: session.riskLevel,
      conversationCategories: [...new Set(categories)],
      consecutiveNegativeInteractions: session.consecutiveNegative,
      sessionDuration: history.length > 0 ? 
        new Date() - new Date(history[0].timestamp) : 0
    };
  }
}

module.exports = MentalHealthBot; 