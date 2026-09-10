@echo off
chcp 65001 >nul
cd /d "%~dp0backend"

echo.
echo ============================================
echo   Radar de Oportunidades - Backend
echo ============================================
echo.

if exist ".venv\Scripts\python.exe" (
  echo Usando ambiente virtual...
  echo Servidor iniciando em http://localhost:8000
  echo Pressione Ctrl+C para parar.
  echo.
  .venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
) else (
  echo Ambiente virtual nao encontrado. Usando Python do sistema...
  echo Servidor iniciando em http://localhost:8000
  echo Pressione Ctrl+C para parar.
  echo.
  python -m uvicorn main:app --reload --port 8000
)

echo.
echo Servidor encerrado.
pause
