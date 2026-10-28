Livestock & Farm Management System - Frontend & Deployment Guide


The process taken-

1. Project Overview & Tech Stack
Project Purpose: A digital platform to track livestock health, data, and management records.

Frontend Framework: React ,built using Vite for fast performance its modern

Styling & UI: Custom CSS 

Version Control: GitHub.

Hosting & Cloud: AWS Amplify.

2. What Has Been Done So Far
Converted the initial functional HTML/JS prototype into a scalable, modern React/Vite application.

The application has been fully tested and verified to run successfully on local development servers.

Pushed the clean project structure (excluding heavy local dependencies) to a secure GitHub repository.

Configured the foundation for cloud deployment via AWS Amplify.

3. How to Run the Project Locally
If you are pulling this code onto your own computer to work on it, follow these steps:

Clone or Download the Repository from GitHub to your local machine.

Open the Project in your code editor (e.g., VS Code).

ensure npm is installed
(This reads the package.json file and downloads all required React tools into a newly created node_modules folder).

Start the Local Development Server:(npm run dev)
View the App: Open your web browser and go to the local link provided in your terminal (usually http://localhost:5173).

4.How to Deploy to AWS Amplify
To deploy your own individual copy of this frontend to your personal AWS account,

create a repository in your own GitHub account.

Log into the AWS Management Console and navigate to AWS Amplify.Click New app -> Host web app.

Connect your GitHub account and select your repository and main branch.

AWS Amplify will automatically detect Vite/React settings. Click Save and deploy.

Once built, AWS will generate a live public URL that you can share for testing!

6. Next Steps for the Team (Backend & Database)
the next task.
