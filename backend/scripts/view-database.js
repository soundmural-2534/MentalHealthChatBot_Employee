#!/usr/bin/env node

/**
 * Database Viewer Script for NeDB
 * 
 * This script allows you to view the contents of your NeDB databases
 * in a readable format since they can't be opened with SQLite tools.
 * 
 * Usage:
 *   node scripts/view-database.js [table_name]
 *   node scripts/view-database.js users
 *   node scripts/view-database.js chat_sessions
 *   node scripts/view-database.js chat_messages
 *   node scripts/view-database.js mood_ratings
 */

require('dotenv').config();
const db = require('../config/database');

const viewDatabase = async (tableName = 'all') => {
  console.log('🔍 NeDB Database Viewer\n');
  
  try {
    if (tableName === 'all' || tableName === 'users') {
      console.log('👥 USERS:');
      const users = await db.users.find({});
      console.log(`Found ${users.length} users:`);
      users.forEach(user => {
        console.log(`  - ID: ${user.id}`);
        console.log(`    Email: ${user.email}`);
        console.log(`    Name: ${user.name}`);
        console.log(`    Created: ${user.createdAt}`);
        console.log('');
      });
    }

    if (tableName === 'all' || tableName === 'chat_sessions') {
      console.log('💬 CHAT SESSIONS:');
      const sessions = await db.chatSessions.find({});
      console.log(`Found ${sessions.length} chat sessions:`);
      sessions.forEach(session => {
        console.log(`  - Session ID: ${session.id}`);
        console.log(`    User ID: ${session.userId}`);
        console.log(`    Active: ${session.active}`);
        console.log(`    Messages: ${session.messageCount}`);
        console.log(`    Started: ${session.startTime}`);
        console.log(`    Last Activity: ${session.lastActivity}`);
        console.log('');
      });
    }

    if (tableName === 'all' || tableName === 'chat_messages') {
      console.log('📝 CHAT MESSAGES:');
      const messages = await db.chatMessages.find({}).limit(10);
      console.log(`Found ${messages.length} messages (showing first 10):`);
      messages.forEach(msg => {
        console.log(`  - Message ID: ${msg.id}`);
        console.log(`    Session: ${msg.sessionId}`);
        console.log(`    From: ${msg.sender}`);
        console.log(`    Text: ${msg.message.substring(0, 100)}${msg.message.length > 100 ? '...' : ''}`);
        console.log(`    Time: ${msg.timestamp}`);
        console.log('');
      });
    }

    if (tableName === 'all' || tableName === 'mood_ratings') {
      console.log('😊 MOOD RATINGS:');
      const moods = await db.moodRatings.find({});
      console.log(`Found ${moods.length} mood ratings:`);
      moods.forEach(mood => {
        console.log(`  - Rating ID: ${mood.id}`);
        console.log(`    User ID: ${mood.userId}`);
        console.log(`    Rating: ${mood.rating}/10`);
        console.log(`    Note: ${mood.note || 'No note'}`);
        console.log(`    Date: ${mood.timestamp}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error reading database:', error.message);
  }
};

// Get table name from command line argument
const tableName = process.argv[2] || 'all';

// Validate table name
const validTables = ['all', 'users', 'chat_sessions', 'chat_messages', 'mood_ratings'];
if (!validTables.includes(tableName)) {
  console.error(`❌ Invalid table name: ${tableName}`);
  console.log('Valid options:', validTables.join(', '));
  process.exit(1);
}

// Run the viewer
viewDatabase(tableName).then(() => {
  console.log('✅ Database view completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Failed to view database:', error.message);
  process.exit(1);
}); 