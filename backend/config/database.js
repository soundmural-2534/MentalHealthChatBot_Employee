const Datastore = require('nedb-promise');
const path = require('path');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '../data');

// Initialize databases
const databases = {
  users: new Datastore({ 
    filename: path.join(dataDir, 'users.db'), 
    autoload: true,
    timestampData: true
  }),
  
  chatSessions: new Datastore({ 
    filename: path.join(dataDir, 'chat_sessions.db'), 
    autoload: true,
    timestampData: true
  }),
  
  chatMessages: new Datastore({ 
    filename: path.join(dataDir, 'chat_messages.db'), 
    autoload: true,
    timestampData: true
  }),
  
  moodRatings: new Datastore({ 
    filename: path.join(dataDir, 'mood_ratings.db'), 
    autoload: true,
    timestampData: true
  })
};

// Create indexes for better performance
databases.chatSessions.ensureIndex({ fieldName: 'userId' });
databases.chatSessions.ensureIndex({ fieldName: 'active' });
databases.chatMessages.ensureIndex({ fieldName: 'sessionId' });
databases.chatMessages.ensureIndex({ fieldName: 'sender' });
databases.chatMessages.ensureIndex({ fieldName: 'timestamp' });
databases.moodRatings.ensureIndex({ fieldName: 'sessionId' });
databases.moodRatings.ensureIndex({ fieldName: 'userId' });

console.log('Database initialized with persistent storage');

module.exports = databases; 