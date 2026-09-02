@echo off
chcp 65001 >nul
echo ==========================================
echo 🎯 RADAR DE OPORTUNIDADES INTELIGENTE
echo ==========================================
echo.

echo 📋 STATUS DO PROJETO:
echo.

REM Verificar estrutura
if exist "backend\main.py" (
    echo ✅ Backend encontrado
) else (
    echo ❌ Arquivo backend\main.py não encontrado
    pause
    exit /b 1
)

if exist "frontend\package.json" (
    echo ✅ Frontend encontrado
) else (
    echo ❌ Arquivo frontend\package.json não encontrado
    pause
    exit /b 1
)

echo.
echo ==========================================
echo 🎯 ESCOLHA UMA OPÇÃO:
echo.
echo 1️⃣  Iniciar APENAS Backend (API)
echo 2️⃣  Iniciar APENAS Frontend (Interface)
echo 3️⃣  Iniciar AMBOS (Recomendado)
echo 4️⃣  Verificar configuração das APIs
echo 5️⃣  Sair
echo.
set /p choice="Digite o número da opção: "

if "%choice%"=="1" goto start_backend
if "%choice%"=="2" goto start_frontend
if "%choice%"=="3" goto start_both
if "%choice%"=="4" goto check_config
if "%choice%"=="5" goto exit
echo ❌ Opção inválida
pause
goto exit

:start_backend
echo.
echo 🚀 Iniciando Backend...
cd backend
start cmd /k "echo === BACKEND === && python -m uvicorn main:app --reload --port 8000"
echo 🌐 Backend rodando em: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
goto exit

:start_frontend
echo.
echo 🚀 Iniciando Frontend...
cd frontend
start cmd /k "echo === FRONTEND === && npm run dev"
echo 🌐 Frontend rodando em: http://localhost:3000
goto exit

:start_both
echo.
echo 🚀 Iniciando Backend e Frontend...
echo 🌐 Aguarde alguns segundos...
echo.

REM Iniciar Backend
cd backend
start cmd /k "echo === BACKEND (API) === && python -m uvicorn main:app --reload --port 8000"
cd ..

timeout /t 3 /nobreak >nul

REM Iniciar Frontend
cd frontend
start cmd /k "echo === FRONTEND (Interface) === && npm run dev"
cd ..

echo ✅ Sistemas iniciados!
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
goto exit

:check_config
echo.
echo 🔍 VERIFICANDO CONFIGURAÇÃO DAS APIs:
echo.

REM Verificar backend .env
echo 🐍 BACKEND (.env):
if exist "backend\.env" (
    for /f "tokens=1,2 delims==" %%a in ('findstr "OPENAI_API_KEY GOOGLE_MAPS_API_KEY" backend\.env 2^>nul') do (
        echo %%a: %%b
        if "%%b"=="" (
            echo   ❌ NÃO CONFIGURADO
        ) else if "%%b"=="sua_chave" (
            echo   ❌ NÃO CONFIGURADO
        ) else (
            echo   ✅ CONFIGURADO
        )
    )
) else (
    echo ❌ Arquivo backend\.env não encontrado
)

echo.

REM Verificar frontend .env.local
echo ⚛️  FRONTEND (.env.local):
if exist "frontend\.env.local" (
    for /f "tokens=1,2 delims==" %%a in ('findstr "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" frontend\.env.local 2^>nul') do (
        echo %%a: %%b
        if "%%b"=="" (
            echo   ❌ NÃO CONFIGURADO
        ) else if "%%b"=="your_google_maps_key_here" (
            echo   ❌ NÃO CONFIGURADO
        ) else (
            echo   ✅ CONFIGURADO
        )
    )
) else (
    echo ⚠️  Arquivo frontend\.env.local não encontrado
)

echo.
echo 📝 DICAS:
echo 1. Configure as APIs primeiro (veja CONFIGURE_APIS.md)
echo 2. Depois execute opção 3 para iniciar tudo
goto exit

:exit
echo.
echo ==========================================
echo ✅ Script concluído
echo 📚 Mais informações em README.md
echo.
pause
