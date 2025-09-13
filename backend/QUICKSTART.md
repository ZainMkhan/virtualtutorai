# Virtual Tutor AI Backend - Project Information

## ⚠️ IMPORTANT: Database First!

**Before using any setup method, start the database:**

```bash
# REQUIRED: Start PostgreSQL with Docker
docker-compose up -d postgres

# Verify database is running
docker-compose ps
```

## Quick Start Commands

### For Windows Users:
```cmd
# 1. Start database FIRST (see above)
docker-compose up -d postgres

# 2. Run the automated setup script
setup.bat

# Manual setup alternative:
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### For macOS/Linux Users:
```bash
# 1. Start database FIRST (see above) 
docker-compose up -d postgres

# 2. Run the automated setup script
chmod +x setup.sh
./setup.sh

# Manual setup alternative:
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## 🔍 Verify Your Setup

### Check Database Connection
After running the setup scripts, verify your `.env` file has the correct database settings:

```env
# These should match your Docker PostgreSQL setup
DB_NAME=virtualtutor_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
USE_SQLITE=False
```

### Test Database Connection
```bash
# Test if Django can connect to the database
python manage.py check --database default

# If successful, you should see: "System check identified no issues"
```

### Common Issues with Setup Scripts:
1. **Database not running**: Make sure `docker-compose up -d postgres` was run first
2. **Wrong credentials**: Verify `.env` file matches the Docker compose settings
3. **Port conflicts**: Ensure port 5432 is not used by another service

## Important URLs

After starting the server with `python manage.py runserver`:

- **API Root**: http://127.0.0.1:8000/api/
- **Swagger Documentation**: http://127.0.0.1:8000/swagger/
- **Admin Panel**: http://127.0.0.1:8000/admin/

## Default Admin Login

Use the credentials you created during `createsuperuser` command to login to the admin panel.

## API Testing

### Login API (POST /api/login/):
```json
{
    "email": "admin@example.com",
    "password": "your_password"
}
```

### Create User API (POST /api/users/create/):
```json
{
    "username": "newuser",
    "email": "user@example.com",
    "password": "password123",
    "password_confirm": "password123",
    "first_name": "John",
    "last_name": "Doe"
}
```

## Project Structure

- `users/` - User management (authentication, CRUD)
- `avatars/` - Avatar management (admin-managed, user-viewable)
- `virtualtutor/` - Main Django project configuration
- `logs/` - Application logs
- `.env` - Environment variables (create from .env.example)

## Development Notes

- JWT tokens expire after 1 hour (configurable)
- Users authenticate with email, not username
- Avatars are managed by admins but visible to all users
- All APIs except login/register require authentication
- CORS is configured for frontend integration

For detailed setup instructions, see README.md