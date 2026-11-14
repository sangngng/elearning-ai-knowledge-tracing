@echo off
rem Deletes ALL database content and recreates the empty schema.
cd /d "%~dp0.."
echo This deletes all data in the local database.
set /p ANSWER=Type YES to continue: 
if /i not "%ANSWER%"=="YES" (
  echo Cancelled.
  pause
  exit /b 0
)
docker compose down -v
docker compose up -d
pause
