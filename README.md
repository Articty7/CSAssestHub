# CSAssetHub – Unreal Asset Management Tool

## Overview
CSAssetHub is a full-stack asset management platform designed for game and CG production pipelines, with a focus on supporting remote workflows for teams working in **Unreal Engine**.

The project combines a React frontend, a Flask backend, a relational database, and Unreal Engine editor-side tooling to support asset exports, metadata tracking, and secure distribution of approved assets.

CSAssetHub integrates skills developed through **App Academy** with my background in **3D modeling, VFX, and technical art**, emphasizing real-world production tooling rather than demo-only CRUD applications.

**The goal of CSAssetHub is to demonstrate how modern full-stack web development can integrate directly with real-time engine workflows used in professional game and CG production.**

> **Engine Version:** Unreal Engine 5.7.1

---

## Tech Stack

### Frontend
- React (JavaScript)
- Axios
- CSS (plain CSS; Tailwind used in supporting projects)

### Backend
- Python
- Flask (REST API)

### Database
- SQLite (SQL)

### Cloud & Infrastructure
- AWS S3 (private bucket with presigned download URLs – v2)
- Docker (planned)
- Render (planned deployment)

### Engine Integration
- Unreal Engine **5.7.1**
- Editor-side tooling (Blueprints)
- Optional Unreal Python scripting

---

## Current Status
- MVP completed: **September 2025**
- Development resumed: **January 2026**
- Current phase: **v2 iteration and polish**

Primary focus:
- Full CRUD completion
- Secure asset storage and public demo access
- Deployment and Unreal Engine pipeline refinement

---

## Public Demo Mode (No Login Required)
CSAssetHub includes a **public, read-only demo mode** intended for recruiters and interviewers.

Public users can:
- Browse approved assets
- View asset metadata and previews
- Download approved assets using **time-limited presigned URLs**

Public users cannot:
- Upload assets
- Modify or delete data
- Access admin or contributor tools

This allows the project to be evaluated without account creation while maintaining security.

---

## Authentication & Roles
Authenticated access uses role-based permissions:

### Admin
- Approves or rejects submitted assets
- Controls asset visibility
- Maintains database quality and organization

### Modeler (Contributor)
- Uploads assets
- Submissions are created with a `pending` status until approved

Assets only become visible in the public demo after admin approval.

---

## Asset Moderation & Verification
To prevent database clutter and ensure quality:
- All uploads begin in a `pending` state
- Admin approval is required for public visibility
- Verification includes:
  - Allowed file types
  - File size limits
  - Required metadata fields
  - Duplicate detection (planned)

---

## Secure Downloads (AWS S3)
Approved assets are stored in a **private AWS S3 bucket**.

Downloads are handled using:
- Presigned URLs
- Short expiration windows (typically 2–5 minutes)

This allows public access without exposing the storage bucket or credentials.

---

## Unreal Engine Integration
CSAssetHub includes Unreal Engine editor-side tooling that connects Unreal workflows to the backend system.

### Features
- Editor-based export actions
- Metadata submission to the backend
- Designed for Unreal Engine **5.7.1**

### Installer Script
The project provides a downloadable Unreal Python installer script with:
- Step-by-step installation instructions
- Automatic editor menu or utility setup
- Test connection and validation steps

This allows Unreal users to integrate CSAssetHub tooling without manual configuration.

---

## Project Structure
The project follows the App Academy capstone convention and is intentionally kept simple for clarity and deployment.

- `app/` – Flask backend API
- `react-vite/` – React frontend (Vite)
- `migrations/` – Database migrations
- `instance/` – Local configuration and database files

---

## Roadmap (v2)
- Finalize database schema
- Complete full CRUD functionality
- AWS S3 private asset storage
- Presigned public download endpoints
- Admin approval dashboard
- Dockerize backend and deploy to Render
- Expand Unreal export automation and metadata capture
- UI/UX polish (loading states, errors, confirmations)

---

## Notes for Reviewers
This project emphasizes:
- Clean architecture over feature sprawl
- Secure public
