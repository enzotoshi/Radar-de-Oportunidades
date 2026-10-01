@echo off
setlocal

if /I "%~1"=="backend" goto backend
if /I "%~1"=="frontend" goto frontend

start "Radar - Backend" cmd /k call "%~f0" backend
start "Radar - Frontend" cmd /k call "%~f0" frontend
exit /b

:backend
cd /d "%~dp0backend"
if exist ".venv\Scripts\python.exe" (
    ".venv\Scripts\python.exe" -m uvicorn main:app --reload --port 8000
) else (
    python -m uvicorn main:app --reload --port 8000
)
exit /b

:frontend
cd /d "%~dp0frontend"
npm run dev
exit /b
