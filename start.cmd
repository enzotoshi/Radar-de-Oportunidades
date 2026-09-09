@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ==========================================
echo RADAR DE OPORTUNIDADES
echo ==========================================
echo 1. Iniciar apenas o backend
echo 2. Iniciar apenas o frontend
echo 3. Iniciar backend e frontend
echo 4. Verificar configuracao
echo 5. Sair
echo.
set /p choice="Escolha uma opcao: "

if "%choice%"=="1" goto backend
if "%choice%"=="2" goto frontend
if "%choice%"=="3" goto both
if "%choice%"=="4" goto check
if "%choice%"=="5" exit /b 0
echo Opcao invalida.
exit /b 1

:backend
start "Radar Backend" cmd /k call "%~dp0INICIAR_BACKEND.cmd"
goto done

:frontend
start "Radar Frontend" cmd /k call "%~dp0INICIAR_FRONTEND.cmd"
goto done

:both
start "Radar Backend" cmd /k call "%~dp0INICIAR_BACKEND.cmd"
timeout /t 2 /nobreak >nul
start "Radar Frontend" cmd /k call "%~dp0INICIAR_FRONTEND.cmd"
goto done

:check
if exist "backend\main.py" (echo Backend: OK) else (echo Backend: ausente)
if exist "backend\.venv\Scripts\python.exe" (echo Ambiente Python: OK) else (echo Ambiente Python: execute INSTALAR_DEPENDENCIAS.cmd)
if exist "frontend\node_modules" (echo Dependencias frontend: OK) else (echo Dependencias frontend: execute INSTALAR_DEPENDENCIAS.cmd)
if exist "frontend\.env.local" (echo Configuracao frontend: .env.local) else (echo Configuracao frontend: padrao http://localhost:8000)
echo Fontes sem chave: OpenStreetMap, Nominatim, IBGE e WorldPop.
echo Voz e opcional e requer GOOGLE_APPLICATION_CREDENTIALS no backend.
goto done

:done
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo OpenAPI:  http://localhost:8000/docs
pause
