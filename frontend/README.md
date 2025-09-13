# Virtual Tutor AI - Frontend Setup Guide

A React-based frontend application for the Virtual Tutor AI system, built with Vite, React, TypeScript, and Tailwind CSS. 

For AI Avatar Interaction, It utilizes HEYGEN Avatars and for AI Chat it uses GEMNI.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 16.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** package manager
- **Git** (for cloning the repository) - [Download here](https://git-scm.com/)

To check if you have these installed, run:
```bash
node --version
npm --version
git --version
```

## 🚀 Getting Started

### 1. Install Dependencies

Install all required packages using npm:

```bash
npm install
```

This will install all the dependencies listed in `package.json`, including:
- React 19.1.1
- TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Axios (HTTP client)
- React Router (navigation)
- Radix UI components
- Google Generative AI
- And more...

### 2. Environment Configuration

Create a `.env` file in the root directory and configure the following variables:

```env
# AI Configuration - Google Gemini API
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
PORT=3000

# Backend API Configuration
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

**Important Environment Variables:**

- `VITE_GEMINI_API_KEY`: Your Google Gemini AI API key (required for AI features)
- `PORT`: Port number for the development server (default: 3000)
- `VITE_API_BASE_URL`: Base URL for API calls to your backend

**Getting a Gemini API Key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and add it to your `.env` file

### 3. Start the Development Server

Run the following command to start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000` (or the port specified in your `.env` file).

## 🌐 Backend Integration

This frontend is designed to work with a backend API. Make sure your backend server is running on the URL specified in (default: `http://127.0.0.1:8000/api`).

## 🔍 Troubleshooting

### Common Issues:

**1. Port already in use**
```bash
Error: Port 3000 is already in use
```
- Solution: Change the `PORT` in your `.env` file or kill the process using port 3000

**2. Module not found errors**
```bash
Error: Cannot resolve module
```
- Solution: Delete `node_modules` and run `npm install` again

**3. Build failures**
```bash
TypeScript compilation errors
```
- Solution: Check the TypeScript errors and fix them, or run `npm run lint` for guidance

### Getting Help:

1. Check the browser console for error messages
2. Ensure all environment variables are correctly set
3. Verify that your backend server is running
4. Make sure you have the correct Node.js version installed
