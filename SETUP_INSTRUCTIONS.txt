# Full-Stack Todo Application Setup Guide

## Step 1: Install Python on Windows

1. Open your web browser and go to: https://www.python.org/downloads/

2. Download the latest Python version (3.9 or higher recommended)

3. Run the downloaded installer

4. **IMPORTANT**: On the first screen, make sure to check the box "Add Python to PATH" before clicking "Install Now"

5. Wait for the installation to complete

6. Close any open Command Prompt or PowerShell windows

7. Open a new Command Prompt or PowerShell window and test the installation:
   ```
   python --version
   ```
   You should see something like "Python 3.x.x"

## Step 2: Set up the Backend (In Command Prompt)

1. Open Command Prompt (Press Win + R, type "cmd", press Enter)

2. Navigate to the backend directory:
   ```
   cd "E:\Hackathon 2 Complete\Hackathon 2 Phase II Full-Stack Web Application\backend"
   ```

3. Create a virtual environment:
   ```
   python -m venv venv
   ```

4. Activate the virtual environment:
   ```
   venv\Scripts\activate
   ```

5. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

6. Create the .env file with required environment variables:
   ```
   echo BETTER_AUTH_SECRET=NX83Ogb4FAGFppGPnkjbDP1iykJ6NPSH > .env
   echo DATABASE_URL=sqlite:///./todo.db >> .env
   echo NEON_DB_URL= >> .env
   echo FRONTEND_ORIGIN=http://localhost:3000 >> .env
   ```

7. Start the backend server:
   ```
   uvicorn main:app --reload --port 8000
   ```

## Step 3: Set up the Frontend (In a New Command Prompt Window)

1. Open a NEW Command Prompt window (do not close the backend window)

2. Navigate to the frontend directory:
   ```
   cd "E:\Hackathon 2 Complete\Hackathon 2 Phase II Full-Stack Web Application\frontend"
   ```

3. Install the required dependencies:
   ```
   npm install
   ```

4. Create the .env.local file:
   ```
   echo NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 > .env.local
   echo NEXTAUTH_URL=http://localhost:3000 >> .env.local
   echo NEXTAUTH_SECRET=NX83Ogb4FAGFppGPnkjbDP1iykJ6NPSH >> .env.local
   echo BETTER_AUTH_SECRET=NX83Ogb4FAGFppGPnkjbDP1iykJ6NPSH >> .env.local
   ```

5. Start the frontend development server:
   ```
   npm run dev
   ```

## Step 4: Access the Application

1. Once both servers are running, open your browser

2. Go to: http://localhost:3000

3. You should now see the full-stack Todo application

## Troubleshooting Tips:

If you get an error about pip not being recognized:
- Make sure Python was installed with "Add Python to PATH" checked
- Restart your command prompt after installing Python

If you get an error about uvicorn not being found:
- Make sure you activated the virtual environment with "venv\Scripts\activate"
- Make sure you installed the requirements with "pip install -r requirements.txt"

If the frontend gives errors:
- Make sure you're in the frontend directory
- Make sure you ran "npm install" successfully

## Important Notes:

- Keep both command prompt windows open while using the application
- The backend runs on http://localhost:8000
- The frontend runs on http://localhost:3000
- The frontend communicates with the backend via API calls