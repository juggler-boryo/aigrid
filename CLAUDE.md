# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a smart home system called "aigrid" (ジャグラ墓料のスマートホームシステム) consisting of three main components:

1. **Server** (`/server`) - Go backend API using Firebase and Discord integrations
2. **App** (`/app`) - React frontend using Vite, MUI Joy, and TypeScript
3. **Hub** (`/hub`) - Python-based home control system with voice commands

## Development Commands

### Running the full stack
```bash
make run  # Runs both frontend and backend concurrently
```

### Frontend (React app)
```bash
cd app
yarn        # Install dependencies
yarn dev    # Start development server
yarn build  # Build for production
yarn lint   # Run ESLint
```

### Backend (Go server)
```bash
cd server
make run   # Start with hot reload using air
make lint  # Run golangci-lint
```

### Hub (Python)
```bash
cd hub
pip install -r requirements.txt
python main.py
```

## Architecture Overview

### Backend Architecture
- **Entry point**: `server/main.go` - Initializes Firebase and Discord, sets up HTTP server
- **Routing**: `server/routes/routes.go` - Defines API endpoints with authentication middleware
- **Handlers**: `server/handlers/` - Business logic for each endpoint
- **Models**: `server/models/` - Data structures for users, NFC, tamaki, and in/out tracking
- **Middleware**: Token authentication for protected routes
- **External Services**: Firebase (auth/database), Discord (notifications)

### Frontend Architecture
- **Entry point**: `app/src/main.tsx` - Sets up routing, theme, and React Query
- **Pages**: `app/src/pages/` - Main views (home, login, profile, tamaki, whiteboard)
- **Components**: `app/src/components/` - Reusable UI components
- **APIs**: `app/src/apis/` - API client functions for backend communication
- **State Management**: React Query for server state, Firebase hooks for auth
- **Styling**: MUI Joy components with custom theme

### Key Features
- **User Authentication**: Firebase-based login system
- **NFC Entry System**: Track entry/exit with Suica cards (`/nfc/{suica_id}`, `/inout/{uid}`)
- **Tamaki System**: Create and manage tamaki entries
- **Analytics**: In/out time tracking and visualization
- **Discord Integration**: Notifications for wake/sleep/trash events
- **Smart Home Control**: Trigger home systems via `/home/{homeId}` endpoint

## Deployment
- **Frontend**: Auto-deploys to Vercel on GitHub push
- **Backend**: Deploy to Google Cloud Run using provided gcloud command in server/readme.md