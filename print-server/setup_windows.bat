@echo off
echo ===================================================
echo Zebra Print Server Setup for Pharmacy RX Manager
echo ===================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed.
    echo Please install Python from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)

echo Python is installed. Installing required packages...
echo.

REM Install required packages
pip install -r requirements-windows.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install required packages.
    echo Please check your internet connection and try again.
    echo.
    pause
    exit /b 1
)

echo.
echo All packages installed successfully!
echo.
echo ===================================================
echo To start the print server, run:
echo python windows_print_server.py
echo ===================================================
echo.
echo The server will display its IP address when started.
echo Use that IP address in your Pharmacy RX Manager app.
echo.
pause
