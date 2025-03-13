# Goss Up

**Goss Up** is a monorepo-based project using **Turborepo**, consisting of three applications and two shared packages. The project integrates modern technologies such as **React**, **Node.js**, **Kafka**, **MongoDB**, and **Firebase Cloud Messaging** to provide real-time communication and backend functionality.

## Note
This is monorepo for gossup-ui and gossup-server, further development and commits will happen in this repo.

## Project Structure

This monorepo contains the following:

### Apps
1. **Frontend (React + TypeScript)**:  
   A **React** application using **TypeScript** for building the user interface.
   
2. **Backend (Node.js + Express)**:  
   A **Node.js** server built with **ExpressJS** to handle API requests and other backend logic.

3. **Consumers (Kafka Consumers)**:  
   Kafka consumers that listen for and process messages from Kafka topics, enabling real-time data streaming.

### Shared Packages
1. **shared-constants**:  
   A package containing shared constants used throughout the project.
   
2. **db-models**:  
   A package containing MongoDB Mongoose models used for interacting with the database.

## Tech Stack

### Frontend
- **React**: JavaScript library for building user interfaces.
- **TypeScript**: A superset of JavaScript that adds type-checking and improves developer experience.
- **Redux Toolkit**: Efficient state management with Redux and less boilerplate.
- **Tailwind CSS**: A utility-first CSS framework for building custom designs rapidly.
- **Shadcn UI**: A set of UI components for building clean and consistent user interfaces.

### Backend
- **Node.js**: A JavaScript runtime for building scalable network applications.
- **ExpressJS**: Fast and minimal web framework for Node.js.
- **MongoDB**: A NoSQL database for storing and querying data.
- **WebSocket**: Real-time bi-directional communication between clients and the backend.
- **Redis**: Key-value store used for caching and managing session data.
- **Kafka**: Distributed event streaming platform for real-time data processing.
- **Firebase Cloud Messaging**: Service for sending notifications to users across different platforms.

## Features

- **Real-time Communication**: WebSocket integration enables real-time communication between frontend and backend.
- **Push Notifications**: Firebase Cloud Messaging is used to send push notifications to frontend users.
- **Kafka Integration**: Kafka consumers process events in real-time from Kafka topics.
- **State Management**: Redux Toolkit manages the state efficiently in the React frontend.
- **MongoDB**: The backend uses MongoDB for data storage and retrieval, integrated via Mongoose models.
- **Modular Architecture**: Shared constants and MongoDB models are managed in separate packages to keep the codebase organized.

## Getting Started

### Prerequisites

Before you begin, ensure that you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (or **Yarn**)
- **Turborepo** (for managing the monorepo)

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/goss-up.git
   cd goss-up
   ```

2. **Install dependencies**:

   From the root of the monorepo, run:

   ```bash
   npm install
   ```

3. **Start the apps**:

   You can start the applications individually or use Turborepo to run them together.

   - **Frontend (React + TypeScript)**:  
     Navigate to the `frontend` folder and run:

     ```bash
     npm run dev
     ```

   - **Backend (Node.js + Express)**:  
     Navigate to the `backend` folder and run:

     ```bash
     npm run dev
     ```

   - **Consumers (Kafka Consumers)**:  
     Navigate to the `consumers` folder and run:

     ```bash
     npm run dev
     ```

### Running the Project with Turborepo

To start all apps together, you can use Turborepo:

```bash
npm run dev
```

This command will start the frontend, backend, and consumers concurrently.

### Environment Variables

Make sure you set up the necessary environment variables in `.env` files in the respective app directories:

1. **Backend**:  
   In the `backend` folder, create a `.env` file with API keys, database URLs, and Kafka settings.
   
2. **Frontend**:  
   In the `frontend` folder, configure `.env` for variables like the API URL for the backend:

   ```env
   REACT_APP_API_URL=http://localhost:5173
   ```

3. **Consumers**:  
   Set up the required environment variables in the `consumers` app as needed (e.g., Kafka broker URLs).
