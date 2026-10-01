@echo off
chcp 65001 >nul
title Atualizar GitHub - Radar de Oportunidades

echo ══════════════════════════════════════════════════════════════════
echo 🔄 ATUALIZAR REPOSITÓRIO NO GITHUB
echo ══════════════════════════════════════════════════════════════════
echo.

REM Verificar se Git está instalado
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git NÃO está instalado!
    echo.
    echo 📥 Baixe e instale o Git:
    echo    https://git-scm.com/download/win
    pause
    exit /b 1
)

REM Verificar se é um repositório Git
if not exist ".git" (
    echo ❌ Esta pasta não é um repositório Git!
    echo.
    echo Execute primeiro: setup-git.cmd
    pause
    exit /b 1
)

echo ✅ Git detectado!
echo.

echo ══════════════════════════════════════════════════════════════════
echo 📋 ARQUIVOS MODIFICADOS
echo ══════════════════════════════════════════════════════════════════
echo.

git status

echo.
echo ══════════════════════════════════════════════════════════════════
echo 📝 CRIAR COMMIT
echo ══════════════════════════════════════════════════════════════════
echo.

set /p COMMIT_MSG="Digite a mensagem do commit (ex: Adiciona análise com IA): "
if "%COMMIT_MSG%"=="" (
    set COMMIT_MSG=Atualização do projeto
)

echo.
echo Adicionando arquivos...
git add .

echo.
echo Criando commit: "%COMMIT_MSG%"
git commit -m "%COMMIT_MSG%"

if errorlevel 1 (
    echo.
    echo ⚠️  Nenhuma mudança para commitar!
    echo    Todos os arquivos já estão atualizados.
    pause
    exit /b 0
)

echo.
echo ══════════════════════════════════════════════════════════════════
echo 🚀 ENVIANDO PARA O GITHUB
echo ══════════════════════════════════════════════════════════════════
echo.

git push

if errorlevel 1 (
    echo.
    echo ❌ Erro ao enviar para o GitHub!
    echo.
    echo Possíveis soluções:
    echo 1. Verifique sua conexão com internet
    echo 2. Use Personal Access Token como senha
    echo 3. Execute: git push -u origin main
    echo.
    pause
    exit /b 1
)

echo.
echo ══════════════════════════════════════════════════════════════════
echo ✅ SUCESSO!
echo ══════════════════════════════════════════════════════════════════
echo.
echo Mudanças enviadas para o GitHub com sucesso!
echo.
echo Commit: "%COMMIT_MSG%"
echo.
pause
