# MyPMOSBuddy - Backend

Express REST API for MyPMOSBuddy.

## Prerequisites

- Node.js installed
- MongoDB Atlas account and connection string
- API Verve API Key (https://apiverve.com/)
- Cloudinary cloud name, API key, and API secret

## Setup

1. Clone the repository
   git clone https://github.com/dsmb95/my-pmos-buddy-backend.git

2. Install dependencies
   npm install

3. Create a .env file in the root and add the following:
   PORT=5000
   MONGO_URI=<your_mongodb_connection_string>
   API_VERVE=<your_api_key_from_apiverve>
   SESSION_SECRET=<create_your_own>
   CLOUDINARY_CLOUD_NAME=<your_cloud_name_from_cloudinary>
   CLOUDINARY_API_KEY=<your_API_key_from_cloudinary>
   CLOUDINARY_API_SECRET=<your_API_secret_from_cloudinary>

4. Start the server
   npm run dev

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/login | Logs the user in. |
| GET | /api/auth/logout | Logs the user out. |
| POST | /api/auth/register | Registers a new user. |
| GET | /api/auth/ | Returns the user's name. |
| GET | /api/flow| Returns the flow data unique to each user. |
| POST | /api/flow | Creates a new document on the collection containing the user's cycle data. |
| PUT | /api/flow | Updates the user's flow data. |
| GET | /api/skin | Returns the skin data unique to each user. |
| POST | /api/skin | Creates a new document on the collection containing the user's skin data. |
| GET | /api/skin/routine | Returns the user's skin routine data. |
| POST | /api/skin/routine| Creates a new document on the collection containing the user's skin routine data. |
| GET| /api/medication| Returns the list of medications unique to each user. |
| POST | /api/medication | Creates a new document on the collection containing the user's list of medications. |
| GET | /api/weight | Returns the users recorded weight. |
| POST | /api/weight | Creates a new document on the collection containing the user's current weight. |