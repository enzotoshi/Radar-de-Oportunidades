@echo off
chcp 65001 >nul
cd /d "%~dp0"

python --version >nul 2>&1 || (
  echo Python nao encontrado.
  exit /b 1
)
node --version >nul 2>&1 || (
  echo Node.js nao encontrado.
  exit /b 1
)

if not exist "backend\.venv\Scripts\python.exe" python -m venv backend\.venv
call backend\.venv\Scripts\python.exe -m pip install --upgrade pip
call backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
if errorlevel 1 exit /b 1

pushd frontend
if exist "package-lock.json" (
  call npm ci
) else (
  call npm install
)
if errorlevel 1 (
  popd
  exit /b 1
)
popd

echo Dependencias instaladas. Execute start.cmd para iniciar o projeto.
pause
