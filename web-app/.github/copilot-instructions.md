# Project Guidelines

## Architecture
- Full-stack medical eligibility verification system: Node/Express backend in backend/, React frontend in frontend/.
- Core security and credential logic lives in backend/utils/crypto.js; treat it as the source of truth for crypto behavior.
- Frontend persists data in memory only via frontend/src/utils/storageManager.js (no localStorage/sessionStorage).

## Build and Test
- Backend: npm run dev (dev), npm start (prod) from backend/.
- Frontend: npm start, npm run build, npm test from frontend/.
- Backend default port: 5000; frontend dev server: 3000 (proxy to backend).

## Conventions
- Use in-memory storage only; do not introduce browser storage. See STORAGE_ERROR_SOLUTION.md.
- Credentials include AES-256-GCM encryption, RSA signatures, and 90-day expiry. See IMPLEMENTATION_SUMMARY.md for format details.
- NMC number validation accepts multiple formats; avoid narrowing unless requirements change.

## Docs
- Setup and run: README.md and QUICK_START.md.
- System behavior and endpoints: SYSTEM_STATUS.md.
- Security/credential details: IMPLEMENTATION_SUMMARY.md.
- Storage design rationale: STORAGE_ERROR_SOLUTION.md.
