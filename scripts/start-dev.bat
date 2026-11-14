@echo off
rem Starts PostgreSQL + Adminer (Docker), the backend and the frontend, then opens the browser.
setlocal
cd /d "%~dp0.."

docker info >nul 2>&1
if errorlevel 1 (
  echo Docker Desktop is not running. Open Docker Desktop, wait for "Engine running", then run this file again.
  pause
  exit /b 1
)

echo [1/4] Starting the database...
docker compose up -d
if errorlevel 1 (
  echo docker compose failed. See the message above.
  pause
  exit /b 1
)

echo [2/4] Preparing the backend...
if not exist backend\.env (
  copy backend\.env.example backend\.env >nul
  powershell -NoProfile -Command "$s=[guid]::NewGuid().ToString('N')+[guid]::NewGuid().ToString('N'); (Get-Content 'backend\.env') -replace '^JWT_SECRET=.*',('JWT_SECRET='+$s) | Set-Content 'backend\.env'"
)
if not exist backend\node_modules (
  pushd backend
  call npm ci
  popd
)

echo [3/4] Preparing the frontend...
if not exist frontend\.env.local copy frontend\.env.example frontend\.env.local >nul
if not exist frontend\node_modules (
  pushd frontend
  call npm ci
  popd
)

echo [4/4] Starting the backend and the frontend in two new windows...
start "Backend (port 8080)" cmd /k "cd /d %cd%\backend && npm run dev"
start "Frontend (port 3000)" cmd /k "cd /d %cd%\frontend && npm run dev"

timeout /t 8 /nobreak >nul
start "" "http://localhost:8081/?pgsql=postgres&username=postgres&db=elearning"
start "" "http://localhost:3000"

echo.
echo Database viewer: password is "postgres". Backend health check: http://localhost:8080/health
echo To stop everything, close the two new windows and run scripts\stop-dev.bat
pause
