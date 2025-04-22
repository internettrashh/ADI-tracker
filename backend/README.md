# Commit Tracker Backend

A Node.js/Express backend that tracks GitHub commits via webhooks and provides commit statistics.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
- Copy `.env.example` to `.env`
- Update MongoDB URI if needed
- Configure port if needed

3. Start the server:
```bash
npm run dev  # for development
npm start    # for production
```

## GitHub Webhook Setup

1. Go to your GitHub repository settings
2. Navigate to Webhooks
3. Add a new webhook:
   - Payload URL: `http://your-domain/webhook`
   - Content type: `application/json`
   - Select events: Choose "Commits" or "Push" events

## API Endpoints

### POST /webhook
Receives GitHub webhook events for commit tracking.

### GET /users/leaderboard
Returns users sorted by total commit count.

### GET /users/:githubId/intensity
Returns commit intensity for the last 20 minutes for a specific user.
- Returns intensity score (0-100)
- Returns recent commit count

## Database

Uses MongoDB to store:
- User information
- Commit history
- Commit statistics

Make sure MongoDB is running locally or update the MONGODB_URI in .env to point to your MongoDB instance. 