@echo off
REM Starts the Django REST API on http://127.0.0.1:8000/
REM Uses cmd.exe so PowerShell script-execution policy does not interfere.
cd /d "%~dp0"
echo Starting Django backend on http://127.0.0.1:8000/ ...
python manage.py runserver 127.0.0.1:8000
pause
