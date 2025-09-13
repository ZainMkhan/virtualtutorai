@echo off
REM Virtual Tutor AI Backend - Quick Setup Script for Windows
REM This script helps you set up the project quickly

echo ===============================================
echo Virtual Tutor AI Backend - Quick Setup
echo ===============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)

echo ✓ Python is installed
echo.

REM Create virtual environment
echo Creating virtual environment...
if exist venv (
    echo Virtual environment already exists
) else (
    python -m venv venv
    echo ✓ Virtual environment created
)
echo.

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
echo ✓ Virtual environment activated
echo.

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip
echo ✓ Pip upgraded
echo.

REM Install requirements
echo Installing Python packages...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install requirements
    pause
    exit /b 1
)
echo ✓ Python packages installed
echo.

REM Create .env file if it doesn't exist
if exist .env (
    echo .env file already exists
) else (
    if exist .env.example (
        copy .env.example .env
        echo ✓ .env file created from template
        echo IMPORTANT: Please edit .env file with your database credentials
    ) else (
        echo WARNING: .env.example file not found
        echo Please create .env file manually
    )
)
echo.

REM Check if we should use SQLite
echo Do you want to use SQLite for development? (easier setup)
echo 1. Yes - Use SQLite (recommended for beginners)
echo 2. No - Use PostgreSQL (recommended for production)
set /p choice="Enter your choice (1 or 2): "

if "%choice%"=="1" (
    echo USE_SQLITE=True >> .env
    echo ✓ Configured to use SQLite
    goto migrations
)

if "%choice%"=="2" (
    echo Configured to use PostgreSQL
    echo Make sure PostgreSQL is installed and running
    echo Update the database settings in .env file
    goto migrations
)

echo Invalid choice, defaulting to SQLite
echo USE_SQLITE=True >> .env

:migrations
echo.
echo Running database migrations...
python manage.py makemigrations
python manage.py migrate
if %errorlevel% neq 0 (
    echo ERROR: Database migration failed
    echo If using PostgreSQL, make sure it's running and credentials are correct
    pause
    exit /b 1
)
echo ✓ Database migrations completed
echo.

REM Create superuser
echo Creating admin user...
echo Please create an admin account for the system:
python manage.py createsuperuser
echo ✓ Admin user created
echo.

echo ===============================================
echo Setup completed successfully! 🎉
echo ===============================================
echo.
echo To start the development server:
echo   python manage.py runserver
echo.
echo Then visit: http://127.0.0.1:8000/
echo API Docs: http://127.0.0.1:8000/swagger/
echo Admin Panel: http://127.0.0.1:8000/admin/
echo.
echo Remember to activate the virtual environment before working:
echo   venv\Scripts\activate
echo.
pause