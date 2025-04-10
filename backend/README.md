# Mental Health Assistant Backend

This is the backend service for the Mental Health Assistant application. It provides APIs for user authentication, depression prediction, and data storage.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment variables template:
   ```bash
   cp .env.example .env
   ```
4. Update the `.env` file with your configuration:
   - Set your PostgreSQL credentials
   - Set your MongoDB connection string
   - Set a secure JWT secret
   - Adjust other settings as needed

5. Initialize the database:
   ```bash
   npm run init-db
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

The API documentation is available at `/api-docs` when the server is running.

### Authentication

- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login and get JWT token
- GET `/api/auth/me` - Get current user profile

### Depression Prediction

- POST `/api/predict` - Submit clinical notes for depression prediction
- GET `/api/predict/history` - Get prediction history for current user

## Development

- `npm run dev` - Start development server with hot reload
- `npm run test` - Run tests
- `npm run lint` - Run linter
- `npm run build` - Build for production

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## License

MIT 