@echo off
setlocal
cd /d "%~dp0"

if not exist "node_modules\vite\bin\vite.js" (
  echo Installing the site's dependencies...
  call npm.cmd install
  if errorlevel 1 (
    echo Dependency installation failed. Check your internet connection and try again.
    pause
    exit /b 1
  )
)

echo Starting the date-night site at http://127.0.0.1:5173/
start "" /b npm.cmd run dev -- --host 127.0.0.1 --port 5173
timeout /t 3 /nobreak >nul
start "" http://127.0.0.1:5173/
echo Keep this window open while using the site. Press Ctrl+C to stop it.
pause
