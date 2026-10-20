# Project and task management app (VFAP version)

This is a React application for project and task management with with JWT-based authentication and more. 

This application is split across two repositories: this repository contains the React frontend, and the [backend is maintained in a separate repository (VBAP branch)](https://github.com/jakubp03/OPR3-project-tracker/tree/vbap).

## Prerequisites

- Node.js 20.19+ or 22.12+.
- npm (included with Node.js).

## Getting Started

1. **Clone the repository** (if not already done):
   ```
   git clone <repository-url>
   cd opr3
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Set up environment variables**:
   - Copy `.env.example` to `.env`:
     ```
     cp .env.example .env
     ```
   - Edit `.env` and set `VITE_API_BASE_URL` to your API base URL (e.g., `http://localhost:3000/api`).

4. **Run the development server**:
   ```
   npm run dev
   ```
   - Open [http://localhost:5173](http://localhost:5173) in your browser.

5. **Build for production**:
   ```
   npm run build
   ```

6. **Preview the production build**:
   ```
   npm run preview
   ```
