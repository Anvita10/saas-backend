🚀 TaskFlow Backend

TaskFlow is a SaaS-based workspace and task management platform.
This repository contains the backend API, responsible for handling authentication, workspace management, and member operations.
Built with a focus on clean architecture, scalability, and maintainability.

📌 Features Implemented

🔐 User Authentication (Signup / Login)
🏢 Workspace Creation & Management
👥 Add / Remove Workspace Members
📄 Fetch Workspace Details
🔍 Access Control (only members can access workspace)
🛡️ Protected Routes using middleware
🔄 Structured API responses
⚙️ Centralized error handling

🛠️ Tech Stack

Express.js
MongoDB
Mongoose
JWT Authentication
s
⚙️ Setup Instructions
1️⃣ Clone the repository
git clone (https://github.com/Anvita10/saas-backend)
2️⃣ Install dependencies
npm install
3️⃣ Configure Environment Variables
Create a .env file in the root:
PORT
MONGO_URI
JWT_SECRET
4️⃣ Start the server
npm start

🔐 Authentication
JWT-based authentication
Token required for protected routes
Middleware verifies user before granting access

👤 Author

Anvita Jain
