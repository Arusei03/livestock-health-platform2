Livestock & Farm Management System - Frontend & Deployment Guide
Welcome to the Livestock Management System project! This document outlines what has been built, how the environment is set up, and the exact steps required for team members to clone, run, and take over the next phases of development (such as backend and database integration).

📋 Table of Contents
Project Overview & Tech Stack

What Has Been Done So Far (Milestones)

Project Directory Structure

How to Run the Project Locally

How to Deploy to AWS Amplify

Next Steps for the Team (Backend & Database)

1. Project Overview & Tech Stack
Project Purpose: A digital platform to track livestock health, data, and management records.

Frontend Framework: React (built using Vite for fast performance and modern hot-reloading).

Styling & UI: Custom CSS / Component-based structure.

Version Control: GitHub.

Hosting & Cloud: AWS Amplify.

2. What Has Been Done So Far (Milestones)
Frontend Migration: Converted the initial functional HTML/JS prototype into a scalable, modern React/Vite application.

Local Testing Verified: The application has been fully tested and verified to run successfully on local development servers (http://localhost:5173).

Version Control & GitHub Setup: Pushed the clean project structure (excluding heavy local dependencies) to a secure GitHub repository.

Cloud Hosting Prototype: Configured the foundation for cloud deployment via AWS Amplify.

3. Project Directory Structure
When you clone or download the repository, your project folder will look like this:

Plaintext
livestock-tracker/
├── public/             # Static assets (images, icons, etc.)
├── src/                # Core application source code
│   ├── App.jsx         # Main React component
│   ├── App.css         # Styling for the main component
│   ├── main.js /.tsx   # Entry point for React
├── .gitignore          # Tells Git which files to ignore (e.g., node_modules)
├── index.html          # Main HTML entry point
├── package.json        # Project metadata and dependencies list
├── package-lock.json   # Locked dependency tree version
└── vite.config.js      # Vite configuration file
4. How to Run the Project Locally
If you are pulling this code onto your own computer to work on it, follow these steps:

Clone or Download the Repository from GitHub to your local machine.

Open the Project in your code editor (e.g., VS Code).

Install Dependencies:
Open your integrated terminal inside the project folder and run:

Bash
npm install
(This reads the package.json file and downloads all required React tools into a newly created node_modules folder).

Start the Local Development Server:

Bash
npm run dev
View the App: Open your web browser and go to the local link provided in your terminal (usually http://localhost:5173).

5. How to Deploy to AWS Amplify
To deploy your own individual copy of this frontend to your personal AWS account:

Push your copy of the repository to your own GitHub account.

Log into the AWS Management Console and navigate to AWS Amplify.Click New app -> Host web app.

Connect your GitHub account and select your repository and main branch.

AWS Amplify will automatically detect Vite/React settings. Click Save and deploy.

Once built, AWS will generate a live public URL that you can share for testing!

6. Next Steps for the Team (Backend & Database)
Now that the frontend interface is fully structured and live, the remaining tasks can be split among group members:

Task 1: Backend & Database Integration

Goal: Move away from isolated or local browser storage so all group members and users share real-time, synced livestock records.

Recommended Tools: Firebase, Supabase, or AWS backend services (like DynamoDB).

Task 2: User Authentication (Logins)

Goal: Implement secure login/signup screens for farm workers and managers.

Task 3: Feature Expansion

Goal: Add advanced reporting, search filters, and mobile-responsive layout enhancements.
