# ForkFriends

A matching system to help employees meet each other during lunch time.

## Overview

Fork Friend is an ultra-simple web application that connects Northeast Delta Dental employees for spontaneous lunch meetups. The app requires minimal user input and serves one purpose: matching available colleagues for lunch each day.

### Core Purpose

To help employees (especially those who struggle with making new connections) meet colleagues through a no-frills, opt-in lunch pairing system.

### Key Features

- One-time name registration
- Simple daily availability toggle
- Countdown timer to 11 AM matching deadline
- Automatic pairing of available users at 11 AM
- View of current day's lunch match
- No built-in messaging - users connect via Webex independently

## Technical Stack

- **Frontend**: React with TypeScript, styled-components, framer-motion
- **Backend/Database**: Firebase (Firestore, Authentication)
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js v14 or higher
- npm v6 or higher
- Firebase project with Firestore enabled

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/fork-friend.git
   cd fork-friend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up Firebase
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Firestore and Authentication
   - Copy your Firebase config
   - Update the config in `src/firebase.ts`

4. Start the development server
   ```
   npm start
   ```

## Deployment

### Vercel Deployment

1. Install Vercel CLI
   ```
   npm install -g vercel
   ```

2. Deploy
   ```
   vercel
   ```

### Firebase Cloud Functions

For the daily matching at 11 AM, you'll need to set up a Firebase Cloud Function:

1. Initialize Firebase Functions in your project
   ```
   firebase init functions
   ```

2. Create a scheduled function that runs daily at 11 AM
   ```javascript
   // functions/index.js
   const functions = require('firebase-functions');
   const admin = require('firebase-admin');
   admin.initializeApp();

   exports.dailyMatching = functions.pubsub
     .schedule('0 11 * * *')
     .timeZone('America/New_York')
     .onRun(async (context) => {
       // Implement matching logic here (similar to src/services/matching.ts)
       return null;
     });
   ```

3. Deploy your functions
   ```
   firebase deploy --only functions
   ```

## License

This project is licensed under the MIT License.
