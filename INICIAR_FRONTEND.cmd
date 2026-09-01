@echo off
chcp 65001 >nul
title Frontend - Radar de Oportunidades

cd /d "%~dp0frontend"

echo ═══════════════════════════════════════
echo ⚛️  INICIANDO FRONTEND
echo ═══════════════════════════════════════
echo.

npm run dev
