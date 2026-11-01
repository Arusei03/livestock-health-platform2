Livestock & Farm Management System - Frontend & Deployment Guide

## Introduction

We are members of the **AWS Student Builder Group at CUK**. Under the agenda of **Economic Participation and Livelihoods**, our group project focuses on creating economic opportunities and supporting sustainable livelihoods, with a particular focus on livestock farmers.

Livestock health records and vaccination schedules can be scattered across farmers and veterinary professionals, making it difficult to track vaccinations and identify potential disease risks in time.

To address this, we propose a **centralized livestock health platform** for recording and accessing health information, tracking vaccination schedules, and analyzing data to identify unusual health patterns and flag potential disease risks for veterinary review. As reliable data grows, the platform can provide more useful, data-driven insights.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) and npm installed.
- [Git](https://git-scm.com/) installed.

### Installation
For contributors: Fork this repository on GitHub before proceeding.

1. Clone the repository:

   ```bash
   git clone <forked-repo-url>
   ```

2. Ensure you are in the project root directory.

3. Install the project dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL displayed in your terminal, usually `http://localhost:5173`.


## Technology Stack — the technologies used and their roles.
## Project Structure — how the codebase is organized.
## Deployment — how the application is deployed to AWS Amplify and other aws services.
## Contributing — branching, pull requests, and review guidelines.
## Future Improvements — planned backend, database, and other features.





4.How to Deploy to AWS Amplify

To deploy your own individual copy of this frontend to your personal AWS account,

create a repository in your own GitHub account.

Log into the AWS Management Console and navigate to AWS Amplify.Click New app -> Host web app.

Connect your GitHub account and select your repository and main branch.

AWS Amplify will automatically detect Vite/React settings. Click Save and deploy.

Once built, AWS will generate a live public URL that you can share for testing!

