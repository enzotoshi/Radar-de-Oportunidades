@echo off
chcp 65001 >nul
cd /d "%~dp0frontend"
call npm run dev
