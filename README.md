# VirtualTutorAI

This repository contains the full stack for the VirtualTutorAI application, split into two main folders:

- **backend/** – Django-based REST API and application logic.
  - Contains the Django project (`virtualtutor`) and multiple apps such as `users`, `subscriptions`, `payments`, `conversations`, `analytics`, and `avatars`.
  - Provides authentication, subscription and payment handling, conversation management, analytics, and other core server-side features.

- **frontend/** – Vite + React + TypeScript single-page application.
  - Contains the user-facing UI for interacting with the VirtualTutorAI platform.
  - Communicates with the backend API for authentication, tutoring features, subscriptions, and related flows.

## High-Level Usage

- Backend: run the Django project from the `backend/` folder (see `backend/README.md` or `backend/QUICKSTART.md` for details).
- Frontend: run the React app from the `frontend/` folder (see `frontend/README.md` for details).
