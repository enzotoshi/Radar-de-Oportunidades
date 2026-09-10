@echo off
chcp 65001 >nul
cd /d "%~dp0frontend"

echo.
echo ============================================
echo   Radar de Oportunidades - Frontend
echo ============================================
echo.

if not exist "node_modules" (
  echo Dependencias nao encontradas. Instalando...
  echo Isso pode demorar alguns minutos na primeira vez.
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo ERRO: Falha ao instalar dependencias.
    pause
    exit /b 1
  )
  echo.
  echo Dependencias instaladas com sucesso!
  echo.
)

echo Servidor iniciando em http://localhost:3000
echo Pressione Ctrl+C para parar.
echo.
call npm run dev

echo.
echo Servidor encerrado.
pause
