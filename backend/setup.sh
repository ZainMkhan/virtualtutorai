#!/bin/bash

# Virtual Tutor AI Backend - Quick Setup Script for macOS/Linux
# This script helps you set up the project quickly

echo "==============================================="
echo "Virtual Tutor AI Backend - Quick Setup"
echo "==============================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "ERROR: Python is not installed or not in PATH"
        echo "Please install Python from https://www.python.org/downloads/"
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

echo "✓ Python is installed"
echo ""

# Create virtual environment
echo "Creating virtual environment..."
if [ -d "venv" ]; then
    echo "Virtual environment already exists"
else
    $PYTHON_CMD -m venv venv
    echo "✓ Virtual environment created"
fi
echo ""

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate
echo "✓ Virtual environment activated"
echo ""

# Upgrade pip
echo "Upgrading pip..."
python -m pip install --upgrade pip
echo "✓ Pip upgraded"
echo ""

# Install requirements
echo "Installing Python packages..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install requirements"
    exit 1
fi
echo "✓ Python packages installed"
echo ""

# Create .env file if it doesn't exist
if [ -f ".env" ]; then
    echo ".env file already exists"
else
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✓ .env file created from template"
        echo "IMPORTANT: Please edit .env file with your database credentials"
    else
        echo "WARNING: .env.example file not found"
        echo "Please create .env file manually"
    fi
fi
echo ""

# Check if we should use SQLite
echo "Do you want to use SQLite for development? (easier setup)"
echo "1. Yes - Use SQLite (recommended for beginners)"
echo "2. No - Use PostgreSQL (recommended for production)"
read -p "Enter your choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    echo "USE_SQLITE=True" >> .env
    echo "✓ Configured to use SQLite"
elif [ "$choice" = "2" ]; then
    echo "Configured to use PostgreSQL"
    echo "Make sure PostgreSQL is installed and running"
    echo "Update the database settings in .env file"
else
    echo "Invalid choice, defaulting to SQLite"
    echo "USE_SQLITE=True" >> .env
fi

echo ""
echo "Running database migrations..."
python manage.py makemigrations
python manage.py migrate
if [ $? -ne 0 ]; then
    echo "ERROR: Database migration failed"
    echo "If using PostgreSQL, make sure it's running and credentials are correct"
    exit 1
fi
echo "✓ Database migrations completed"
echo ""

# Create superuser
echo "Creating admin user..."
echo "Please create an admin account for the system:"
python manage.py createsuperuser
echo "✓ Admin user created"
echo ""

echo "==============================================="
echo "Setup completed successfully! 🎉"
echo "==============================================="
echo ""
echo "To start the development server:"
echo "  python manage.py runserver"
echo ""
echo "Then visit: http://127.0.0.1:8000/"
echo "API Docs: http://127.0.0.1:8000/swagger/"
echo "Admin Panel: http://127.0.0.1:8000/admin/"
echo ""
echo "Remember to activate the virtual environment before working:"
echo "  source venv/bin/activate"
echo ""