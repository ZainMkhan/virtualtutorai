# Virtual Tutor AI - Backend

A Django REST API backend for a Virtual Tutor AI application with user management and avatar integration.

## 📋 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Quick Setup](#-quick-setup)
- [Detailed Installation](#-detailed-installation)
- [Environment Configuration](#-environment-configuration)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Troubleshooting](#-troubleshooting)

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Docker Desktop** - [Download Docker](https://www.docker.com/products/docker-desktop/) (Recommended for PostgreSQL)
- **Git** - [Download Git](https://git-scm.com/downloads)

**Optional (if not using Docker):**
- **PostgreSQL 12+** - [Download PostgreSQL](https://www.postgresql.org/download/)

### Check Your Installations

```bash
# Check Python version
python --version
# or
python3 --version

# Check Docker
docker --version
docker-compose --version

# Check Git
git --version

# Check PostgreSQL (if installed manually)
psql --version
```

## 🚀 Quick Setup

If you're familiar with Django and just want to get started quickly:

```bash
# 1. Start PostgreSQL with Docker (recommended)
docker-compose up -d postgres

# 2. Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create .env file (see Environment Configuration section)
copy .env.example .env  # Windows
# cp .env.example .env  # macOS/Linux

# 5. Setup database and run
python manage.py migrate
python manage.py seed_database
python manage.py runserver
```

## 🤖 Automated Setup (Recommended for Beginners)

We provide automated setup scripts that handle the entire installation process:

### **⚠️ IMPORTANT: Database Setup First**

**Before running the setup scripts**, you MUST start the database:

```bash
# Start PostgreSQL with Docker (REQUIRED)
docker-compose up -d postgres

# Verify the database is running
docker-compose ps
```

### **Windows Users:**
```cmd
# After starting the database above, run:
setup.bat
```

### **macOS/Linux Users:**
```bash
# After starting the database above, run:
chmod +x setup.sh
./setup.sh
```

### **What the Setup Scripts Do:**
1. ✅ Create Python virtual environment
2. ✅ Install all dependencies
3. ✅ Create `.env` file from template
4. ✅ Ask you to choose database type (SQLite or PostgreSQL)
5. ✅ Run database migrations
6. ✅ Seed database with admin user, regular user, and subscription tiers
7. ✅ Provide next steps instructions

### **Important Notes:**
- **Database First**: Always start `docker-compose up -d postgres` before running setup scripts
- **Environment Variables**: The script will create a `.env` file, but verify the database settings match:
  ```env
  DB_NAME=virtualtutor_db
  DB_USER=postgres
  DB_PASSWORD=postgres
  DB_HOST=localhost
  DB_PORT=5432
  USE_SQLITE=False
  ```
- **Admin Account**: You'll be prompted to create an admin account during setup
- **Virtual Environment**: The script creates and activates a virtual environment automatically

### **After Setup Completes:**
```bash
# Start the development server
python manage.py runserver

# Visit these URLs:
# API Root: http://127.0.0.1:8000/api/
# Swagger Docs: http://127.0.0.1:8000/swagger/
# Admin Panel: http://127.0.0.1:8000/admin/
```

## 🔧 Detailed Installation

### Step 1: Set Up Python Virtual Environment

A virtual environment isolates your project dependencies from your system Python.

**On Windows:**
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# You should see (venv) in your command prompt
```

**On macOS/Linux:**
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# You should see (venv) in your terminal prompt
```

### Step 2: Install Python Dependencies

```bash
# Make sure your virtual environment is activated
pip install --upgrade pip
pip install -r requirements.txt
```

## 🔧 Environment Configuration

### Step 1: Create Environment File

Create a `.env` file in the backend root directory:

```bash
# Copy the example file
copy .env.example .env  # Windows
# cp .env.example .env  # macOS/Linux
```

### Step 2: Configure Environment Variables

Edit the `.env` file with your settings:

```env
# Django Settings
SECRET_KEY=your-super-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration
DB_NAME=virtualtutor_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432

# For development only - use SQLite instead of PostgreSQL
USE_SQLITE=False

# CORS Settings (if you have a frontend)
CORS_ALLOW_ALL_ORIGINS=False
```

**Important Notes:**
- Replace `your-super-secret-key-here` with a real secret key
- Replace `your_postgres_password` with your PostgreSQL password
- Set `USE_SQLITE=True` if you want to use SQLite for development instead of PostgreSQL
- **Stripe Keys** (optional for development, required for payments):
  - Get `STRIPE_API_KEY` from https://dashboard.stripe.com/apikeys
  - Get `STRIPE_PUBLISHABLE_KEY` from https://dashboard.stripe.com/apikeys
  - Get `STRIPE_WEBHOOK_SECRET` from https://dashboard.stripe.com/webhooks (after creating webhook endpoint)
  - Use `sk_test_*` and `pk_test_*` keys for development
  - Use `sk_live_*` and `pk_live_*` keys for production

### Step 3: Generate a Secret Key

You can generate a Django secret key using Python:

```python
# Run this in Python shell
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

## 🗄️ Database Setup

You have two options: PostgreSQL (recommended for production) or SQLite (easier for development).

### Option A: PostgreSQL Setup (Recommended)

#### Method 1: Using Docker (Recommended & Easiest) 🐳

The easiest way to set up PostgreSQL is using Docker with the provided `docker-compose.yml` file:

**Prerequisites:**
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Make sure Docker is running

**Setup Steps:**
```bash
# Start PostgreSQL container
docker-compose up -d postgres

# Verify the container is running
docker-compose ps

# Check logs if needed
docker-compose logs postgres
```

**Database Configuration:**
The docker-compose setup automatically creates:
- Database: `virtualtutor_db`
- User: `postgres`
- Password: `postgres`
- Port: `5432`

**Update .env File:**
```env
DB_NAME=virtualtutor_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
USE_SQLITE=False
STRIPE_API_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

**Useful Docker Commands:**
```bash
# Stop PostgreSQL container
docker-compose down

# Remove PostgreSQL container and data (caution: deletes all data!)
docker-compose down -v

# View PostgreSQL logs
docker-compose logs postgres

# Connect to PostgreSQL directly
docker-compose exec postgres psql -U postgres -d virtualtutor_db
```

#### Method 2: Manual PostgreSQL Installation

If you prefer to install PostgreSQL manually:

**Windows:**
- Download from [PostgreSQL Official Website](https://www.postgresql.org/download/windows/)
- Run the installer and remember the password you set for the `postgres` user

**macOS:**
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql
```

**Ubuntu/Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Create Database and User:**
```bash
# Connect to PostgreSQL
psql -U postgres

# In PostgreSQL shell, create database and user
CREATE DATABASE virtualtutor_db;
CREATE USER virtualtutor_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE virtualtutor_db TO virtualtutor_user;
\q
```

**Update .env File:**
```env
DB_NAME=virtualtutor_db
DB_USER=virtualtutor_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
USE_SQLITE=False
```

### Option B: SQLite Setup (Easier for Development)

If you want to use SQLite instead of PostgreSQL for development:

1. Update your `.env` file:
```env
USE_SQLITE=True
```

2. That's it! Django will automatically create an SQLite database file.

### Option C: Stripe Configuration (Payment Processing)

The application integrates with Stripe for payment processing. To enable payments:

**Step 1: Create a Stripe Account**
- Visit [Stripe.com](https://stripe.com)
- Sign up for a free account

**Step 2: Get Your API Keys**
- Go to [API Keys Dashboard](https://dashboard.stripe.com/apikeys)
- You'll see "Publishable key" and "Secret key"
- For development, use the keys with `test_` prefix
- For production, use the keys with `live_` prefix (keep these secret!)

**Step 3: Get Your Webhook Secret**
- Go to [Webhooks Dashboard](https://dashboard.stripe.com/webhooks)
- Click "Add endpoint" and set the URL to: `https://your-domain.com/api/webhooks/stripe/`
- Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `invoice.paid`, `invoice.payment_failed`
- Copy the "Signing secret" shown in the webhook details

**Step 4: Update .env File**
```env
STRIPE_API_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

**Important:**
- ⚠️ **NEVER** commit your Stripe keys to version control
- For development testing, use `sk_test_*` and `pk_test_*` keys
- Stripe provides test card numbers like `4242 4242 4242 4242` for testing
- Switch to live keys only when deploying to production

## 🚀 Running the Application

### Step 1: Apply Database Migrations

```bash
# Make sure your virtual environment is activated and you're in the backend directory
python manage.py makemigrations
python manage.py migrate
```

### Step 2: Seed Database

```bash
python manage.py seed_database
```

This command automatically creates:
- **4 Subscription Tiers**: Free, Basic, Pro, Enterprise with different usage limits
- **Admin User**: admin@virtualtutror.ai / admin123456
- **Regular User**: user@example.com / user123456
- **Usage Limits**: For each user based on their tier

All users start with a free tier subscription.

### Step 3: Run the Development Server

```bash
python manage.py runserver
```

You should see output like:
```
System check identified no issues (0 silenced).
December 12, 2024 - 15:30:45
Django version 5.2.6, using settings 'virtualtutor.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

### Step 4: Test the Installation

Open your browser and visit:

- **API Root**: http://127.0.0.1:8000/api/
- **Swagger Documentation**: http://127.0.0.1:8000/swagger/
- **Admin Panel**: http://127.0.0.1:8000/admin/

## 📚 API Documentation

### Authentication

All API endpoints (except login and user registration) require JWT authentication.

#### Login
```http
POST /api/login/
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "your_password"
}
```

Response:
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "access_token_expiry": "2025-09-11T15:30:00Z",
        "refresh_token_expiry": "2025-09-18T14:30:00Z",
        "user_id": 1,
        "email": "user@example.com",
        "role": "user"
    }
}
```

#### Using JWT Tokens

Include the access token in the Authorization header for authenticated requests:

```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### Main API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/login/` | User login | No |
| POST | `/api/users/create/` | User registration | No |
| GET | `/api/users/` | List all users | Yes |
| GET | `/api/users/{id}/` | Get user by ID | Yes |
| PUT | `/api/users/{id}/update/` | Update user | Yes |
| DELETE | `/api/users/{id}/delete/` | Delete/manage user | Yes (Admin) |
| GET | `/api/avatars/list/` | List all avatars | Yes |
| GET | `/api/avatars/{id}/` | Get avatar by ID | Yes |
| POST | `/api/avatars/create/` | Create avatar | Yes (Admin) |
| PUT | `/api/avatars/{id}/update/` | Update avatar | Yes (Admin) |
| DELETE | `/api/avatars/{id}/delete/` | Delete avatar | Yes (Admin) |
| GET | `/api/subscriptions/tiers/` | List subscription tiers | Yes |
| GET | `/api/subscriptions/current/` | Get current subscription | Yes |
| GET | `/api/subscriptions/usage/` | Get usage statistics | Yes |
| POST | `/api/subscriptions/usage/update-interactive-minutes/` | Update interactive minutes | Yes |
| POST | `/api/subscriptions/upgrade/` | Upgrade/downgrade subscription | Yes |
| POST | `/api/subscriptions/cancel/` | Cancel subscription | Yes |

### Subscription API Examples

#### Get Current Subscription
```http
GET /api/subscriptions/current/
Authorization: Bearer <access_token>
```

Response:
```json
{
    "success": true,
    "message": "Subscription retrieved successfully",
    "data": {
        "id": "uuid",
        "tier": {
            "id": "uuid",
            "tier": "free",
            "name": "free",
            "display_name": "Free"
        },
        "status": "active",
        "current_period_start": "2025-01-01T00:00:00Z",
        "current_period_end": "2025-02-01T00:00:00Z"
    }
}
```

#### Get Usage Statistics
```http
GET /api/subscriptions/usage/
Authorization: Bearer <access_token>
```

Response:
```json
{
    "success": true,
    "message": "Usage statistics retrieved successfully",
    "tier": {
        "id": "uuid",
        "tier": "free",
        "name": "free",
        "display_name": "Free"
    },
    "data": {
        "messages_sent": 10,
        "messages_limit": 50,
        "messages_remaining": 40,
        "messages_percentage": 20.0,
        "interactive_minutes_used": 5,
        "interactive_minutes_limit": 10,
        "interactive_minutes_remaining": 5,
        "interactive_minutes_percentage": 50.0
    }
}
```

#### Update Interactive Minutes
```http
POST /api/subscriptions/usage/update-interactive-minutes/
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "minutes": 10
}
```

Response:
```json
{
    "success": true,
    "message": "Interactive minutes updated successfully",
    "data": {
        "minutes_added": 10,
        "total_used": 15,
        "limit": 60,
        "remaining": 45,
        "percentage_used": 25.0
    }
}
```

### Complete API Documentation

Visit http://127.0.0.1:8000/swagger/ for interactive API documentation with all endpoints, parameters, and examples.

## 📁 Project Structure

```
backend/
├── manage.py                 # Django management script
├── requirements.txt          # Python dependencies
├── .env                     # Environment variables (create this)
├── db.sqlite3              # SQLite database (if using SQLite)
├── logs/                   # Log files
│   └── django.log
├── virtualtutor/           # Main Django project
│   ├── __init__.py
│   ├── settings.py         # Django settings
│   ├── urls.py            # Main URL configuration
│   ├── wsgi.py            # WSGI config
│   └── asgi.py            # ASGI config
├── users/                  # User management app
│   ├── models.py          # User model
│   ├── views.py           # User API views
│   ├── serializers.py     # User serializers
│   ├── urls.py            # User URL patterns
│   └── migrations/        # Database migrations
└── avatars/                # Avatar management app
    ├── models.py          # Avatar model
    ├── views.py           # Avatar API views
    ├── serializers.py     # Avatar serializers
    ├── urls.py            # Avatar URL patterns
    └── migrations/        # Database migrations
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Error

**Error:** `connection to server at "localhost", port 5432 failed`

**Solutions:**
- **Using Docker (Recommended):**
  ```bash
  # Check if PostgreSQL container is running
  docker-compose ps
  
  # Start PostgreSQL container
  docker-compose up -d postgres
  
  # Check container logs
  docker-compose logs postgres
  
  # Restart container if needed
  docker-compose restart postgres
  ```

- **Manual PostgreSQL Installation:**
  ```bash
  # Windows
  services.msc  # Look for postgresql service and start it
  # Or
  net start postgresql-x64-15
  
  # macOS
  brew services start postgresql
  
  # Linux
  sudo systemctl start postgresql
  ```

- **Use SQLite for development:** Set `USE_SQLITE=True` in your `.env` file

- **Check database credentials:** Verify your `.env` file has correct database settings

#### 2. Module Not Found Errors

**Error:** `ModuleNotFoundError: No module named 'rest_framework'`

**Solution:**
```bash
# Make sure virtual environment is activated
pip install -r requirements.txt
```

#### 3. Migration Issues

**Error:** Migration conflicts or database errors

**Solution:**
```bash
# Reset migrations (development only!)
python manage.py migrate --fake users zero
python manage.py migrate --fake avatars zero
python manage.py makemigrations users
python manage.py makemigrations avatars
python manage.py migrate
```

#### 4. Permission Denied on Windows

**Error:** Scripts execution policy errors

**Solution:**
```bash
# Run PowerShell as Administrator and execute:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 5. Port Already in Use

**Error:** `Error: That port is already in use.`

**Solution:**
```bash
# Use a different port
python manage.py runserver 8001

# Or kill the process using port 8000 (Windows)
netstat -ano | findstr :8000
taskkill /PID <process_id> /F
```

### Getting Help

1. **Check Django Logs:** Look in the `logs/django.log` file for detailed error messages
2. **Django Documentation:** https://docs.djangoproject.com/
3. **Django REST Framework:** https://www.django-rest-framework.org/
4. **Create an Issue:** If you find a bug, create an issue in the project repository

## 🤝 Development Guidelines

### Making Changes

1. **Always activate your virtual environment** before working:
   ```bash
   venv\Scripts\activate  # Windows
   # source venv/bin/activate  # macOS/Linux
   ```

2. **Create migrations after model changes:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

3. **Test your changes:**
   ```bash
   python manage.py runserver
   ```

### Environment Management

- **Development:** Use SQLite or local PostgreSQL
- **Production:** Use PostgreSQL with proper environment variables
- **Never commit:** `.env` files or database files to version control


