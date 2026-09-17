@echo off
REM ============================================================
REM  Student Management System - one-click local dev launcher
REM ============================================================
REM  Opens two windows:
REM    1) Django REST API  -> http://127.0.0.1:8000/
REM    2) React (Vite) app -> http://localhost:5173/
REM  Double-click this file (or run it from any terminal).
REM ============================================================

echo Starting Student Management System dev servers...

start "SMS Backend  (Django :8000)" cmd /k call "%~dp0backend\run-backend.bat"
start "SMS Frontend (Vite :5173)"  cmd /k call "%~dp0frontend\run-frontend.bat"

echo.
echo   Frontend app : http://localhost:5173/
echo   Backend API  : http://127.0.0.1:8000/api/
echo   Django admin : http://127.0.0.1:8000/admin/
echo.
echo Two new windows were opened - keep them running.
echo Wait until Vite prints "Local: http://localhost:5173/", then open the link above.
pause
