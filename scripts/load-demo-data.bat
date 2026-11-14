@echo off
rem Loads throwaway demo data for CO2003 (1 instructor, 8 students, 15 sessions, 40 questions) into an EMPTY database.
rem Login password of every demo account: Demo@2026  (instructor: a.nguyen@hcmut.edu.vn, student: b.nguyen@hcmut.edu.vn)
rem Not the official seed (task S1-3). Run reset-db.bat first if the data was already loaded.
cd /d "%~dp0.."
docker exec -i elearning_postgres psql -U postgres -d elearning -v ON_ERROR_STOP=1 < scripts\demo_seed_CO2003.sql
if errorlevel 1 (
  echo Loading failed. If the data is already loaded, run scripts\reset-db.bat first.
) else (
  echo Demo data loaded.
)
pause
