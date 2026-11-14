@echo off
rem Stops the containers. The database content is kept. Close the backend/frontend windows yourself.
cd /d "%~dp0.."
docker compose down
pause
