# Setting Up the Full-Stack Todo Application

This guide will help you run both the frontend and backend of the Todo application locally.

## Prerequisites

Before starting, make sure you have the following installed:

### For Backend (Python):
- Python 3.9 or higher
- pip (Python package installer)

### For Frontend (Node.js):
- Node.js 18 or higher
- npm (Node package manager)

## Step 1: Setting up the Backend

1. Navigate to the backend directory:
```bash
cd E:\Hackathon 2 Complete\Hackathon 2 Phase II Full-Stack Web Application\backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
   - On Windows:
   ```bash
   venv\Scripts\activate
   ```
   - On macOS/Linux:
   ```bash
   source venv/bin/activate
   ```

4. Install the required dependencies:
```bash
pip install -r requirements.txt
```

5. Create a `.env` file in the backend directory with the following content:
```env
BETTER_AUTH_SECRET=NX83Ogb4FAGFppGPnkjbDP1iykJ6NPSH
DATABASE_URL=sqlite:///./todo.db
NEON_DB_URL=
FRONTEND_ORIGIN=http://localhost:3000
```

6. Start the backend server:
```bash
uvicorn main:app --reload --port 8000
```

The backend should now be running on `http://localhost:8000`.

## Step 2: Setting up the Frontend

1. Open a new terminal/command prompt window
2. Navigate to the frontend directory:
```bash
cd E:\Hackathon 2 Complete\Hackathon 2 Phase II Full-Stack Web Application\frontend
```

3. Install the required dependencies:
```bash
npm install
```

4. Create a `.env.local` file in the frontend directory with the following content:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=NX83Ogb4FAGFppGPnkjbDP1iykJ6NPSH
BETTER_AUTH_SECRET=NX83Ogb4FAGFppGPnkjbDP1iykJ6NPSH
```

5. Start the frontend development server:
```bash
npm run dev
```

The frontend should now be running on `http://localhost:3000`.

## Step 3: Running Both Together

1. Make sure both servers are running:
   - Backend: `http://localhost:8000`
   - Frontend: `http://localhost:3000`

2. Open your browser and navigate to `http://localhost:3000`

3. You should now be able to use the full-stack Todo application!

## Troubleshooting

### Common Issues:

1. **Port already in use**: If you get an error about ports being in use, you may have other applications running on ports 8000 or 3000. Close those applications or configure different ports.

2. **Python not found**: Make sure Python is installed and added to your system PATH.

3. **Node.js not found**: Make sure Node.js is installed and added to your system PATH.

4. **Dependency installation issues**: If you encounter issues with dependency installation, try clearing cache:
   - For npm: `npm cache clean --force`
   - For Python: `pip cache purge`

### Verifying the Connection:

1. Test the backend directly by visiting `http://localhost:8000/docs` to see the FastAPI documentation
2. The frontend should automatically connect to the backend API at `http://localhost:8000` as specified in the environment variables

## How the Full-Stack Works Together:

- The frontend (Next.js app) runs on port 3000
- The backend (FastAPI app) runs on port 8000
- The frontend makes API calls to the backend using the API client in `lib/api.ts`
- Authentication is handled with JWT tokens stored in localStorage
- The backend enforces user isolation so users can only access their own tasks
- All API calls from the frontend include the JWT token in the Authorization header