@echo off
REM Starts the React (Vite) dev server on http://localhost:5173/
REM npm.cmd is used on purpose: PowerShell blocks npm.ps1 (execution policy).
cd /d "%~dp0"
echo Starting Vite frontend on http://localhost:5173/ ...
call npm.cmd run dev
pause
