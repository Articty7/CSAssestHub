# AssetHub – Unreal Asset Management Tool

## Overview
AssetHub is a full-stack asset management platform designed for game and CG production pipelines.  
It combines a React frontend, a Flask backend, a relational database, and Unreal Engine editor-side tooling to support asset exports, metadata tracking, and secure distribution of approved assets.

The project focuses on realistic tooling workflows rather than simple CRUD demos.

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
- AWS S3 (private bucket with presigned download URLs)
- Docker (planned)
- Render (planned deployment)

### Engine Integration
- Unreal Engine **5.7.1**
- Blueprint-based editor tooling
- Optional Unreal Python scripting

---

## Current Status
- MVP completed: **September 2025**
- Development resumed: **January 2026**
- Current phase: **v2 iteration and polish**

Primary focus:
- Full CRUD completion
- Secure asset storage and public demo access
- Deployment and Unreal pipeline refinement

---

## Public Demo Mode (No Login Required)
AssetHub includes a **public, read-only demo mode** intended for recruiters and interviewers.

Public users can:
- Browse approved assets
- View asset metadata and previews
- Download approved assets via time-limited presigned URLs

Public users cannot:
- Upload assets
- Modify or delete data
- Access admin or contributor tools

This allows evaluation of the project without account creation while maintaining security.

---

## Authentication & Roles
Authenticated access uses role-based permissions:

### Admin
- Approve or reject submitted assets
- Control asset visibility
- Maintain database quality and organization

### Modeler (Contributor)
- Upload assets
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

AssetHub includes Unreal Engine editor-side tooling that connects Unreal workflows to the backend system.

### Features
- Editor-based export actions
- Metadata submission to backend
- Designed for Unreal Engine **5.7.1**

### Installer Script
The project provides a downloadable Unreal Python installer script with:
- Step-by-step installation instructions
- Automatic editor menu or utility setup
- Test connection / validation steps

This allows Unreal users to integrate AssetHub tooling without manual configuration.

---

## Roadmap (v2)
- Finalize database schema
- Complete full CRUD functionality
- AWS S3 asset storage integration
- Presigned public download endpoints
- Admin approval dashboard
- Dockerize backend and deploy to Render
- Expand Unreal export automation and metadata capture
- UI/UX polish (loading states, errors, confirmations)

---

## Notes for Reviewers
This project emphasizes:
- Clean architecture over feature sprawl
- Secure public access patterns
- Realistic asset pipeline workflows
- Iterative development from MVP to production-ready tooling
