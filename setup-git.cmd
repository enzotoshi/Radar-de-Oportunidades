@echo off
chcp 65001 >nul
title Setup Git - Radar de Oportunidades

echo ══════════════════════════════════════════════════════════════════
echo 📤 CONFIGURAÇÃO RÁPIDA DO GIT
echo ══════════════════════════════════════════════════════════════════
echo.

REM Verificar se Git está instalado
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git NÃO está instalado!
    echo.
    echo 📥 Baixe e instale o Git:
    echo    https://git-scm.com/download/win
    echo.
    echo Depois de instalar, execute este script novamente.
    pause
    exit /b 1
)

echo ✅ Git está instalado!
echo.

REM Verificar se já tem repositório Git
if exist ".git" (
    echo ⚠️  Repositório Git já existe!
    echo.
    choice /C SN /M "Deseja reconfigurar? (S/N)"
    if errorlevel 2 goto skip_init
    if errorlevel 1 (
        echo Removendo .git existente...
        rmdir /s /q .git
    )
)

:skip_init

echo.
echo ══════════════════════════════════════════════════════════════════
echo 📝 CONFIGURAÇÃO DO GIT
echo ══════════════════════════════════════════════════════════════════
echo.

REM Pedir nome do usuário
set /p GIT_NAME="Digite seu NOME (para commits): "
if "%GIT_NAME%"=="" (
    echo ❌ Nome não pode ser vazio!
    pause
    exit /b 1
)

REM Pedir email
set /p GIT_EMAIL="Digite seu EMAIL (mesmo do GitHub): "
if "%GIT_EMAIL%"=="" (
    echo ❌ Email não pode ser vazio!
    pause
    exit /b 1
)

echo.
echo Configurando Git...
git config --global user.name "%GIT_NAME%"
git config --global user.email "%GIT_EMAIL%"

echo ✅ Git configurado!
echo    Nome: %GIT_NAME%
echo    Email: %GIT_EMAIL%
echo.

echo ══════════════════════════════════════════════════════════════════
echo 📦 INICIALIZANDO REPOSITÓRIO
echo ══════════════════════════════════════════════════════════════════
echo.

if not exist ".git" (
    echo Inicializando repositório Git...
    git init
    echo ✅ Repositório inicializado!
) else (
    echo ✅ Repositório já existe!
)

echo.
echo Adicionando arquivos...
git add .

echo.
echo Criando commit inicial...
git commit -m "Initial commit - Radar de Oportunidades Inteligente"

echo.
echo ══════════════════════════════════════════════════════════════════
echo 🌐 CONECTAR COM GITHUB
echo ══════════════════════════════════════════════════════════════════
echo.
echo ANTES DE CONTINUAR:
echo 1. Crie um repositório no GitHub
echo 2. NÃO adicione README, .gitignore ou license (já temos)
echo 3. Copie a URL do repositório
echo.
echo Exemplo de URL:
echo https://github.com/seu-usuario/radar-de-oportunidades.git
echo.

set /p REPO_URL="Cole a URL do seu repositório GitHub: "
if "%REPO_URL%"=="" (
    echo ❌ URL não pode ser vazia!
    echo.
    echo Execute este comando depois:
    echo git remote add origin SUA_URL_AQUI
    echo git branch -M main
    echo git push -u origin main
    pause
    exit /b 1
)

echo.
echo Adicionando repositório remoto...
git remote remove origin >nul 2>&1
git remote add origin "%REPO_URL%"

echo.
echo Renomeando branch para 'main'...
git branch -M main

echo.
echo ══════════════════════════════════════════════════════════════════
echo 🚀 ENVIANDO PARA O GITHUB
echo ══════════════════════════════════════════════════════════════════
echo.
echo Enviando arquivos para o GitHub...
echo.
echo ⚠️  Se pedir usuário/senha:
echo    • Usuário: seu nome de usuário do GitHub
echo    • Senha: use um Personal Access Token (não a senha normal)
echo.
echo Como obter token: https://github.com/settings/tokens
echo.

git push -u origin main

if errorlevel 1 (
    echo.
    echo ❌ Erro ao enviar para o GitHub!
    echo.
    echo Possíveis soluções:
    echo 1. Verifique a URL do repositório
    echo 2. Use Personal Access Token em vez de senha
    echo 3. Verifique sua conexão com internet
    echo.
    echo Tente manualmente:
    echo git push -u origin main
    pause
    exit /b 1
)

echo.
echo ══════════════════════════════════════════════════════════════════
echo ✅ SUCESSO!
echo ══════════════════════════════════════════════════════════════════
echo.
echo Seu projeto foi enviado para o GitHub!
echo.
echo Acesse: %REPO_URL:.git=%
echo.
echo ══════════════════════════════════════════════════════════════════
echo 📝 COMANDOS ÚTEIS:
echo ══════════════════════════════════════════════════════════════════
echo.
echo Adicionar mudanças:   git add .
echo Criar commit:         git commit -m "mensagem"
echo Enviar para GitHub:   git push
echo Puxar do GitHub:      git pull
echo Ver status:           git status
echo.
pause
