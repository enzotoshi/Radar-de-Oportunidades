@echo off
chcp 65001 >nul
title Backend - Radar de Oportunidades

cd /d "%~dp0backend"

echo ═══════════════════════════════════════
echo 🐍 INICIANDO BACKEND
echo ═══════════════════════════════════════
echo.

python -m uvicorn main:app --reload --port 8000
