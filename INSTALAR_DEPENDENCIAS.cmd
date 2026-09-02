@echo off
chcp 65001 >nul
title Instalando Dependências - Radar de Oportunidades

echo ╔══════════════════════════════════════════════════════════════╗
echo ║  📦 INSTALANDO DEPENDÊNCIAS DO PROJETO                      ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo ⏱️  Isso pode demorar 5-10 minutos...
echo ☕ Pegue um café enquanto aguarda!
echo.

REM Verificar Python
echo 🔍 Verificando Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python não encontrado!
    echo.
    echo 📥 Baixe e instale Python em: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)
python --version
echo ✅ Python encontrado!
echo.

REM Verificar Node.js
echo 🔍 Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado!
    echo.
    echo 📥 Baixe e instale Node.js em: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
node --version
echo ✅ Node.js encontrado!
echo.

echo ═══════════════════════════════════════════════════════════════
echo.

REM Atualizar pip
echo 🔄 Atualizando pip...
python -m pip install --upgrade pip --quiet
echo ✅ Pip atualizado!
echo.

echo ═══════════════════════════════════════════════════════════════
echo.

REM Instalar dependências do Backend
echo 🐍 INSTALANDO BACKEND (Python)...
echo 📂 Pasta: backend\
echo.
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo.
    echo ❌ Erro ao instalar dependências do backend!
    echo.
    pause
    exit /b 1
)
echo.
echo ✅ Backend instalado com sucesso!
cd ..

echo.
echo ═══════════════════════════════════════════════════════════════
echo.

REM Instalar dependências do Frontend
echo ⚛️  INSTALANDO FRONTEND (Node.js)...
echo 📂 Pasta: frontend\
echo.
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ❌ Erro ao instalar dependências do frontend!
    echo.
    pause
    exit /b 1
)
echo.
echo ✅ Frontend instalado com sucesso!
cd ..

echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo ✅ INSTALAÇÃO COMPLETA!
echo.
echo 🎉 Tudo pronto para usar!
echo.
echo 🚀 Próximos passos:
echo    1. Duplo clique em: start.cmd
echo    2. Escolha opção 3 (Iniciar AMBOS)
echo    3. Abra: http://localhost:3000
echo.
echo 🔑 (Opcional) Configure OpenAI API:
echo    Edite: backend\.env
echo    Linha: OPENAI_API_KEY=sua_chave
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
pause
