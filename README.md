# MindCare - Mental Health Chatbot for Employee Wellness

A comprehensive mental health support platform built with Node.js and React.js, designed specifically for employee wellness programs. MindCare provides AI-powered mental health support, resources, and tracking capabilities to help employees maintain their mental wellbeing.

## 🌟 Features

### Core Functionality
- **AI-Powered Chatbot**: Intelligent mental health support with contextual responses
- **Real-time Communication**: WebSocket-based chat for instant support
- **Mood Tracking**: Monitor mental wellness journey with analytics
- **Resource Library**: Curated mental health resources and coping strategies
- **Crisis Support**: Immediate access to emergency mental health resources

### User Experience
- **Modern UI/UX**: Beautiful, responsive design with smooth animations
- **Guest Access**: Try the platform without registration
- **Mobile Responsive**: Full functionality across all devices
- **Accessibility**: Built with accessibility best practices

### Security & Privacy
- **JWT Authentication**: Secure user sessions
- **Data Encryption**: Protected mental health information
- **Rate Limiting**: Protection against abuse
- **CORS Protection**: Secure cross-origin requests

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository_url>
   cd MentalHealthChatBot_Employee
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install all dependencies (backend + frontend)
   npm run install-all
   ```

3. **Start the development servers**
   ```bash
   # Start both backend and frontend concurrently
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/api/health

### Manual Setup

If you prefer to run backend and frontend separately:

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

## 📁 Project Structure

```
MentalHealthChatBot_Employee/
├── backend/                 # Node.js Express server
│   ├── routes/             # API routes
│   │   ├── auth.js         # Authentication endpoints
│   │   ├── chat.js         # Chat functionality
│   │   └── resources.js    # Mental health resources
│   ├── utils/              # Utility functions
│   │   └── mentalHealthBot.js  # AI chatbot logic
│   ├── package.json        # Backend dependencies
│   └── server.js           # Express server setup
├── frontend/               # React.js application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts (Auth, Chat)
│   │   ├── pages/          # Page components
│   │   └── App.js          # Main App component
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── package.json            # Root package.json with scripts
└── README.md              # This file
```

## 🔧 Configuration

### Backend Configuration
The backend uses environment variables for configuration. Default values are provided for development.

Key configurations:
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment mode (development/production)
- `JWT_SECRET`: JWT signing secret
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:3000)

### Frontend Configuration
The frontend automatically connects to the backend running on port 5000 via proxy configuration.

## 🛠 Available Scripts

### Root Level Scripts
- `npm run dev` - Start both backend and frontend in development mode
- `npm run install-all` - Install dependencies for both backend and frontend
- `npm run build` - Build the frontend for production
- `npm start` - Start the backend in production mode

### Backend Scripts
- `npm run dev` - Start backend with nodemon (auto-restart)
- `npm start` - Start backend in production mode

### Frontend Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/guest` - Guest login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### Chat Endpoints
- `POST /api/chat/session` - Create/get chat session
- `GET /api/chat/history/:sessionId` - Get chat history
- `POST /api/chat/message` - Save chat message
- `POST /api/chat/mood` - Submit mood rating

### Resources Endpoints
- `GET /api/resources` - Get all resource categories
- `GET /api/resources/:category` - Get resources by category
- `GET /api/resources/wellness/tip` - Get daily wellness tip

## 🎨 Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware

### Frontend
- **React.js** - UI framework
- **Material-UI (MUI)** - Component library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **Framer Motion** - Animations

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- CORS protection
- Input validation and sanitization
- Secure session management

## 🏥 Mental Health Resources

MindCare includes comprehensive mental health resources:

### Crisis Support
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741
- Emergency Services: 911

### Professional Help
- Employee Assistance Programs (EAP)
- Therapist directories
- Online therapy platforms

### Wellness Resources
- Meditation and mindfulness apps
- Mental health education
- Coping strategies and techniques

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

If you're experiencing a mental health crisis, please contact:
- **National Suicide Prevention Lifeline**: 988
- **Crisis Text Line**: Text HOME to 741741
- **Emergency Services**: 911

For technical support, please create an issue in the repository.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Mental health professionals who provided guidance on best practices
- Open source communities for the amazing tools and libraries
- Everyone working to reduce mental health stigma in the workplace

---

**Disclaimer**: MindCare is designed to provide support and resources for mental wellness. It is not a replacement for professional mental health treatment. If you're experiencing a mental health crisis, please seek immediate professional help. 