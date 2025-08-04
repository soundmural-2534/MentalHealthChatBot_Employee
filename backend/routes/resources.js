const express = require('express');
const router = express.Router();

// Mental health resources data
const mentalHealthResources = {
  emergency: {
    title: "Emergency & Crisis Support",
    priority: "high",
    resources: [
      {
        id: "crisis-1",
        name: "National Suicide Prevention Lifeline",
        description: "24/7 free and confidential support for people in distress",
        contact: "988",
        type: "phone",
        available: "24/7",
        website: "https://suicidepreventionlifeline.org"
      },
      {
        id: "crisis-2",
        name: "Crisis Text Line",
        description: "Text-based crisis support available 24/7",
        contact: "Text HOME to 741741",
        type: "text",
        available: "24/7",
        website: "https://crisistextline.org"
      },
      {
        id: "crisis-3",
        name: "Emergency Services",
        description: "For immediate medical or safety emergencies",
        contact: "911",
        type: "emergency",
        available: "24/7"
      },
      {
        id: "crisis-4",
        name: "SAMHSA National Helpline",
        description: "Treatment referral and information service",
        contact: "1-800-662-4357",
        type: "phone",
        available: "24/7",
        website: "https://samhsa.gov"
      }
    ]
  },
  professional: {
    title: "Professional Mental Health Services",
    priority: "medium",
    resources: [
      {
        id: "prof-1",
        name: "Employee Assistance Program (EAP)",
        description: "Free counseling services for employees and their families",
        contact: "Contact HR for details",
        type: "workplace",
        available: "Business hours",
        benefits: ["Free sessions", "Confidential", "Work-life balance support"]
      },
      {
        id: "prof-2",
        name: "Psychology Today Therapist Finder",
        description: "Directory to find therapists, psychiatrists, and support groups",
        contact: "Online directory",
        type: "directory",
        website: "https://psychologytoday.com",
        features: ["Insurance filtering", "Specialty search", "Reviews"]
      },
      {
        id: "prof-3",
        name: "BetterHelp Online Therapy",
        description: "Professional online therapy and counseling",
        contact: "Online platform",
        type: "online",
        website: "https://betterhelp.com",
        features: ["Text therapy", "Video sessions", "Flexible scheduling"]
      },
      {
        id: "prof-4",
        name: "Talkspace",
        description: "Online therapy with licensed therapists",
        contact: "Mobile app and web",
        type: "online",
        website: "https://talkspace.com",
        features: ["Messaging therapy", "Live sessions", "Psychiatry services"]
      }
    ]
  },
  wellness: {
    title: "Wellness & Self-Care Resources",
    priority: "low",
    resources: [
      {
        id: "well-1",
        name: "Headspace",
        description: "Meditation and mindfulness app",
        contact: "Mobile app",
        type: "app",
        website: "https://headspace.com",
        features: ["Guided meditation", "Sleep stories", "Focus music"]
      },
      {
        id: "well-2",
        name: "Calm",
        description: "Sleep stories, meditation, and relaxation",
        contact: "Mobile app",
        type: "app",
        website: "https://calm.com",
        features: ["Sleep stories", "Daily meditation", "Nature sounds"]
      },
      {
        id: "well-3",
        name: "NAMI (National Alliance on Mental Illness)",
        description: "Mental health education and support",
        contact: "Online resources and local chapters",
        type: "educational",
        website: "https://nami.org",
        features: ["Support groups", "Educational resources", "Advocacy"]
      },
      {
        id: "well-4",
        name: "Mental Health America",
        description: "Mental health information and screening tools",
        contact: "Online platform",
        type: "educational",
        website: "https://mhanational.org",
        features: ["Screening tools", "Resource library", "Community programs"]
      }
    ]
  },
  workplace: {
    title: "Workplace Mental Health",
    priority: "medium",
    resources: [
      {
        id: "work-1",
        name: "Workplace Mental Health Toolkit",
        description: "Resources for managing mental health at work",
        type: "guide",
        topics: ["Stress management", "Work-life balance", "Communication strategies"]
      },
      {
        id: "work-2",
        name: "Mental Health First Aid",
        description: "Training to identify and respond to mental health crises",
        type: "training",
        website: "https://mentalhealthfirstaid.org"
      }
    ]
  }
};

// Daily wellness tips
const wellnessTips = [
  {
    id: 1,
    category: "mindfulness",
    title: "Practice Deep Breathing",
    tip: "Take 5 deep breaths: inhale for 4 counts, hold for 4, exhale for 6. This activates your body's relaxation response.",
    timeRequired: "2 minutes"
  },
  {
    id: 2,
    category: "physical",
    title: "Take a Walking Break",
    tip: "Even a 5-minute walk can boost mood and energy. Try walking outside if possible for added benefits.",
    timeRequired: "5 minutes"
  },
  {
    id: 3,
    category: "social",
    title: "Connect with Someone",
    tip: "Reach out to a friend, family member, or colleague. Social connections are vital for mental health.",
    timeRequired: "10 minutes"
  },
  {
    id: 4,
    category: "gratitude",
    title: "Practice Gratitude",
    tip: "Write down three things you're grateful for today. This simple practice can shift your mindset positively.",
    timeRequired: "3 minutes"
  },
  {
    id: 5,
    category: "boundaries",
    title: "Set a Boundary",
    tip: "Practice saying 'no' to one thing today that doesn't serve your wellbeing or priorities.",
    timeRequired: "1 minute"
  },
  {
    id: 6,
    category: "self-care",
    title: "Do Something You Enjoy",
    tip: "Engage in a hobby or activity that brings you joy, even if just for a few minutes.",
    timeRequired: "15 minutes"
  }
];

// Coping strategies by category
const copingStrategies = {
  anxiety: [
    {
      name: "5-4-3-2-1 Grounding Technique",
      description: "Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste",
      timeRequired: "3-5 minutes",
      effectiveness: "high"
    },
    {
      name: "Box Breathing",
      description: "Breathe in for 4, hold for 4, out for 4, hold for 4. Repeat 4-8 times",
      timeRequired: "2-4 minutes",
      effectiveness: "high"
    },
    {
      name: "Progressive Muscle Relaxation",
      description: "Tense and release muscle groups starting from your toes up to your head",
      timeRequired: "10-15 minutes",
      effectiveness: "medium"
    }
  ],
  stress: [
    {
      name: "Time Blocking",
      description: "Break your day into focused time blocks with specific tasks and break periods",
      timeRequired: "Planning: 10 minutes",
      effectiveness: "high"
    },
    {
      name: "Prioritization Matrix",
      description: "Categorize tasks as urgent/important to focus on what truly matters",
      timeRequired: "5-10 minutes",
      effectiveness: "high"
    },
    {
      name: "Quick Stress Reset",
      description: "Step away, take 10 deep breaths, stretch your arms above your head",
      timeRequired: "2 minutes",
      effectiveness: "medium"
    }
  ],
  depression: [
    {
      name: "Behavioral Activation",
      description: "Schedule one small, pleasurable activity each day, even when you don't feel like it",
      timeRequired: "15-30 minutes",
      effectiveness: "high"
    },
    {
      name: "Thought Challenging",
      description: "Write down negative thoughts and challenge them with evidence and alternatives",
      timeRequired: "10-15 minutes",
      effectiveness: "medium"
    },
    {
      name: "Social Connection",
      description: "Reach out to one person today, even if it's just a text message",
      timeRequired: "5 minutes",
      effectiveness: "high"
    }
  ]
};

// Routes

// Get all resource categories
router.get('/', (req, res) => {
  try {
    const categories = Object.keys(mentalHealthResources).map(key => ({
      category: key,
      title: mentalHealthResources[key].title,
      priority: mentalHealthResources[key].priority,
      resourceCount: mentalHealthResources[key].resources.length
    }));

    res.json({
      categories,
      totalResources: categories.reduce((sum, cat) => sum + cat.resourceCount, 0)
    });
  } catch (error) {
    console.error('Resources overview error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get resources by category
router.get('/:category', (req, res) => {
  try {
    const { category } = req.params;
    
    if (!mentalHealthResources[category]) {
      return res.status(404).json({ message: 'Resource category not found' });
    }

    res.json(mentalHealthResources[category]);
  } catch (error) {
    console.error('Category resources error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get daily wellness tip
router.get('/wellness/tip', (req, res) => {
  try {
    const { category } = req.query;
    
    let availableTips = wellnessTips;
    if (category) {
      availableTips = wellnessTips.filter(tip => tip.category === category);
    }

    if (availableTips.length === 0) {
      return res.status(404).json({ message: 'No tips found for this category' });
    }

    // Get a random tip
    const randomTip = availableTips[Math.floor(Math.random() * availableTips.length)];

    res.json({
      tip: randomTip,
      totalTips: wellnessTips.length,
      categories: [...new Set(wellnessTips.map(tip => tip.category))]
    });
  } catch (error) {
    console.error('Wellness tip error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get coping strategies
router.get('/coping/:type', (req, res) => {
  try {
    const { type } = req.params;
    
    if (!copingStrategies[type]) {
      return res.status(404).json({ 
        message: 'Coping strategy type not found',
        availableTypes: Object.keys(copingStrategies)
      });
    }

    res.json({
      type,
      strategies: copingStrategies[type],
      totalStrategies: copingStrategies[type].length
    });
  } catch (error) {
    console.error('Coping strategies error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Search resources
router.get('/search/:query', (req, res) => {
  try {
    const { query } = req.params;
    const searchQuery = query.toLowerCase();
    const results = [];

    // Search through all resources
    Object.keys(mentalHealthResources).forEach(categoryKey => {
      const category = mentalHealthResources[categoryKey];
      category.resources.forEach(resource => {
        const matchesName = resource.name.toLowerCase().includes(searchQuery);
        const matchesDescription = resource.description.toLowerCase().includes(searchQuery);
        const matchesType = resource.type.toLowerCase().includes(searchQuery);

        if (matchesName || matchesDescription || matchesType) {
          results.push({
            ...resource,
            category: categoryKey,
            categoryTitle: category.title
          });
        }
      });
    });

    res.json({
      query,
      results,
      totalResults: results.length
    });
  } catch (error) {
    console.error('Resource search error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get emergency contacts (always accessible)
router.get('/emergency/contacts', (req, res) => {
  try {
    res.json({
      emergency: mentalHealthResources.emergency,
      timestamp: new Date().toISOString(),
      message: "If you're in immediate danger, please call 911 or go to your nearest emergency room."
    });
  } catch (error) {
    console.error('Emergency contacts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 