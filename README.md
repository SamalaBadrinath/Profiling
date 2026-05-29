# Profiling

A modular, lightweight Node.js web application designed for candidate profiling and portfolio management. The application is built with a highly decoupled modular structure (adhering to the Island Protocol), hosted on Cloudflare Workers, and utilizes Cloudflare's serverless database and storage systems.

## Project Summary

"Profiling" serves as a professional showcase platform where candidates can register, manage their profiles, upload resumes, and list their technical categories. The platform provides an administrative interface for a single administrator to oversee all candidate profiles, manage categories, and review applications.

## Structural Architecture

The application operates with two primary roles to maintain strict access control and separation of concerns:

1. **Single Admin**:
   - Authorized access to administrative dashboards.
   - Capability to view, search, and manage all candidate profiles.
   - Administrative override for profile content and system-wide categories.

2. **Multiple Candidates**:
   - Self-service registration and authentication.
   - Profile management including name, contact details, profile category, and resume updates.
   - Secure upload of resumes to Cloudflare R2 storage.

## Technology Stack

- **Backend Runtime**: Node.js
- **Web Framework**: Express.js
- **Serverless Hosting**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Object Storage**: Cloudflare R2 Storage (for resumes/assets)
- **Frontend**: Vanilla HTML / Vanilla CSS / Vanilla JavaScript
