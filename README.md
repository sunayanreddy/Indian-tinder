# Indian Tinder App

## Overview
The Indian Tinder App is a dating application designed to connect users based on their preferences and interests. The app allows users to swipe through profiles, match with others, and engage in conversations.

## Features
- User profile creation and management
- Swipe functionality to like or pass on profiles
- Match notifications and chat interface
- API integration for user interactions and matches

## Project Structure
The project is structured into two main parts: frontend and backend.

### Frontend
- **src/pages/api/index.tsx**: API endpoint for handling user interactions and matches.
- **src/components/SwipeCard.tsx**: Component for displaying user profiles.
- **src/components/MatchModal.tsx**: Component for displaying match notifications.
- **src/hooks/useSwipe.ts**: Custom hook for managing swipe gestures.
- **src/services/api.ts**: Functions for making API calls to the backend.
- **src/styles/globals.css**: Global CSS styles for the application.

### Backend
- **src/app.ts**: Entry point for the backend application, setting up the server.
- **src/controllers/matchesController.ts**: Handles match-related requests.
- **src/routes/index.ts**: Sets up routes for the backend application.
- **src/services/matchService.ts**: Contains business logic for managing matches.
- **src/models/user.ts**: Defines the user model.
- **src/repositories/userRepo.ts**: Handles database operations related to users.

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd indian-tinder-app
   ```
3. Install dependencies for the frontend and backend:
   ```
   cd frontend && npm install
   cd ../backend && npm install
   ```

## Running the Application
- To start the frontend:
  ```
  cd frontend
  npm start
  ```
- To start the backend:
  ```
  cd backend
  npm start
  ```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.