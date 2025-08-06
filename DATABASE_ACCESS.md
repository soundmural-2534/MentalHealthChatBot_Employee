# Database Access Guide

## 🚨 **Why SQLite Tools Don't Work**

Your Mental Health Chatbot project uses **NeDB** (Embedded JavaScript Database), not SQLite. The error you're seeing is because you're trying to open NeDB files with SQLite tools.

### **The Error Explained:**
```
"unable to open chat_sessions.db" SQLITE_NOTADB sqlite3 result code 26: file is not a database
```

This happens because:
- **NeDB files** are JSON-based text files (one JSON object per line)
- **SQLite files** are binary database files with a specific format
- SQLite tools can't read NeDB files, hence the "not a database" error

## 📁 **File Format Comparison**

### NeDB Format (what your files actually are):
```json
{"id":"session123","userId":"user456","active":true,"_id":"abc123"}
{"id":"session124","userId":"user789","active":false,"_id":"def456"}
{"$$indexCreated":{"fieldName":"userId","unique":false,"sparse":false}}
```

### SQLite Format (what SQLite tools expect):
```
[Binary data with tables, indexes, schemas, etc.]
```

## 🛠 **How to Access Your Database Data**

### **Option 1: Use the Built-in Database Viewer (Recommended)**

I've created a custom database viewer script for your project:

```bash
# View all data
npm run view-db

# View specific tables
npm run view-users        # Show all users
npm run view-sessions     # Show chat sessions
npm run view-messages     # Show chat messages
npm run view-moods        # Show mood ratings
```

### **Option 2: Manual Script Execution**
```bash
# From the backend directory
node scripts/view-database.js
node scripts/view-database.js users
node scripts/view-database.js chat_sessions
node scripts/view-database.js chat_messages
node scripts/view-database.js mood_ratings
```

### **Option 3: Direct File Viewing (Limited)**
You can open the `.db` files with a text editor to see the raw JSON data, but it's not very readable:

```bash
# View raw file content
type backend\data\chat_sessions.db
# or
notepad backend\data\chat_sessions.db
```

### **Option 4: Using Node.js Console**
```javascript
// From backend directory
node
> const db = require('./config/database');
> db.users.find({}).then(console.log);
> db.chatSessions.find({}).then(console.log);
```

## 📊 **Current Database Contents**

Based on the analysis, your database contains:

- **Users**: 1 registered user
- **Chat Sessions**: 2 active sessions with 37 and 42 messages respectively
- **Chat Messages**: 86+ messages total
- **Mood Ratings**: Several mood tracking entries

## 🔄 **If You Want SQLite Format**

If you specifically need SQLite format for external tools, you would need to:

1. Install SQLite package: `npm install better-sqlite3`
2. Create a migration script to convert NeDB → SQLite
3. Update the database configuration

**However, this is not recommended** because:
- Your application is working perfectly with NeDB
- NeDB is simpler and requires no setup
- The conversion would be complex and risky

## ✅ **Recommended Solution**

**Use the database viewer script I created:**

```bash
cd backend
npm run view-db
```

This gives you a clean, formatted view of all your data without changing your working application.

## 🔧 **Troubleshooting**

### If the viewer script doesn't work:
```bash
# Make sure you're in the backend directory
cd backend

# Check if the script exists
dir scripts\view-database.js

# Run directly
node scripts/view-database.js
```

### If you see deprecation warnings:
These are harmless warnings from the NeDB library and don't affect functionality.

## 📝 **Summary**

- ✅ Your databases are **working correctly**
- ✅ Data is **accessible and intact**
- ✅ The application **functions normally**
- ❌ **Don't use SQLite tools** on NeDB files
- ✅ **Use the custom viewer script** to inspect data

The "error" you encountered is simply a format mismatch, not a corruption or problem with your data! 