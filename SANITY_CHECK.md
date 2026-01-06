- 2026-01-01: Repo reactivated, UE 5.7.1 noted

# Sanity Check Log

## Jan 1, 2026
- Project reactivated
- README updated with v2 roadmap
- Unreal Engine version confirmed: 5.7.1
- Environment verification scheduled for Jan 2

## Planned Jan 2 Checks
- Backend (Flask) startup
- Frontend (React) startup
- Unreal project opens in UE 5.7.1

# Sanity Check – Jan 5, 2026

## Backend
- [x] Flask starts on http://127.0.0.1:8000
- [x] API returns assets: GET /api/assets (200)
- [x] DB queries run successfully (SQLAlchemy logs present)

## Frontend
- [x] UI loads from Flask: GET / (200)
- [x] Static assets served: /assets/*.js and /assets/*.css (200)
- [x] UI can reach API (confirmed by /api/assets)

## Auth
- [x] Protected routes return unauthorized when logged out:
  - GET /api/auth/ → 401
  - GET /api/users/ → redirects to unauthorized → 401
