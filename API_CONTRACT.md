# CivicFix — RESTful API Contract & Specification (Phase 2)

**Version:** 2.0.0  
**Status:** PROPOSED & RATIFIED FOR IMPLEMENTATION  
**Standard:** OpenAPI 3.1.0 / RFC 7807 (Problem Details for HTTP APIs)  
**Target Backend:** Node.js 20+ with Express, PostgreSQL & Prisma ORM  
**Security Model:** Stateless JSON Web Token (JWT) Bearer Authentication + bcrypt password hashing (12 salt rounds) + HTTP-only Refresh Cookie  
**Target Frontend:** React 19 + Vite + Tailwind CSS + Leaflet / OpenStreetMap  

---

## Table of Contents
1. [Architecture & Design Principles](#1-architecture--design-principles)
2. [Global Standards & Conventions](#2-global-standards--conventions)
3. [Standard Error Envelope (RFC 7807)](#3-standard-error-envelope-rfc-7807)
4. [Role-Based Access Control (RBAC) Matrix](#4-role-based-access-control-rbac-matrix)
5. [Authentication API (5 Endpoints)](#5-authentication-api)
   - [5.1 Register](#51-register)
   - [5.2 Login](#52-login)
   - [5.3 Logout](#53-logout)
   - [5.4 Refresh Token](#54-refresh-token)
   - [5.5 Current User Profile](#55-current-user-profile)
6. [Citizen Grievance API (8 Endpoints)](#6-citizen-grievance-api)
   - [6.1 Create Issue](#61-create-issue)
   - [6.2 Upload Issue Photo](#62-upload-issue-photo)
   - [6.3 Get My Issues](#63-get-my-issues)
   - [6.4 Get Issue Details](#64-get-issue-details)
   - [6.5 Update Allowed Issue Information](#65-update-allowed-issue-information)
   - [6.6 Add Comment](#66-add-comment)
   - [6.7 Track Status by Code](#67-track-status-by-code)
   - [6.8 Receive Notifications](#68-receive-notifications)
7. [Public & Transparency API (4 Endpoints)](#7-public--transparency-api)
   - [7.1 View Civic Issues Feed](#71-view-civic-issues-feed)
   - [7.2 View Issue Map (GeoJSON)](#72-view-issue-map-geojson)
   - [7.3 Filter Issues](#73-filter-issues)
   - [7.4 Search Issues](#74-search-issues)
8. [Administrative & Dispatcher Operations API (8 Endpoints)](#8-administrative--dispatcher-operations-api)
   - [8.1 Get All Issues](#81-get-all-issues)
   - [8.2 Verify Issue](#82-verify-issue)
   - [8.3 Assign Issue to Field Worker](#83-assign-issue-to-field-worker)
   - [8.4 Update Lifecycle Status](#84-update-lifecycle-status)
   - [8.5 Reject Issue](#85-reject-issue)
   - [8.6 Add Official Comment / Internal Note](#86-add-official-comment--internal-note)
   - [8.7 Upload Resolution Proof](#87-upload-resolution-proof)
   - [8.8 View Dashboard Statistics](#88-view-dashboard-statistics)
9. [Postman & OpenAPI Integration Guide](#9-postman--openapi-integration-guide)

---

## 1. Architecture & Design Principles

The CivicFix REST API adheres to strict architectural principles:
- **Contract-First Discipline**: Backend implementation must strictly conform to this approved contract without deviating endpoint paths, HTTP verbs, payload keys, or status codes.
- **RESTful Resource Hierarchy**: Entities are modeled hierarchically using plural nouns (`/api/v1/issues`, `/api/v1/issues/:id/photos`, `/api/v1/issues/:id/comments`).
- **Stateless Authentication**: Access tokens are signed JWTs with a 15-minute expiration window containing `sub` (User ID), `email`, `role`, and `councilWard`. Long-lived refresh tokens (7 days) are stored as cryptographically hashed records in PostgreSQL via Prisma.
- **Auditing & Immutability**: Critical lifecycle changes (`issue_status_history`, `assignments`, `resolution_proof`) are append-only.
- **Geospatial Standards**: GIS endpoints output standard OGC GeoJSON FeatureCollections (`Point` geometry: `[longitude, latitude]`) consumed directly by Leaflet / OpenStreetMap.

---

## 2. Global Standards & Conventions

| Attribute | Specification |
|:---|:---|
| **Base URL** | `https://api.civicfix.city.gov/api/v1` (Production) / `http://localhost:3000/api/v1` (Local Dev) |
| **Content-Type** | `application/json; charset=utf-8` (Default) or `multipart/form-data` (Photo Uploads) |
| **Date/Time Format** | ISO 8601 UTC string: `YYYY-MM-DDTHH:mm:ss.sssZ` |
| **ID Standard** | Positive 64-bit integer (`BigInt` / `number`) |
| **Tracking Code Standard** | Human-readable alphanumeric: `CVX-YYYY-XXXXX` (e.g., `CVX-2026-08142`) |
| **Pagination Style** | Zero-leak cursor or offset pagination: `{ page, limit, totalItems, totalPages, hasNextPage }` |

---

## 3. Standard Error Envelope (RFC 7807)

All non-2xx HTTP responses return the standardized RFC 7807 Problem Details payload:

```json
{
  "type": "https://api.civicfix.city.gov/errors/INVALID_PAYLOAD",
  "title": "Validation Failed",
  "status": 422,
  "detail": "Field 'categoryId' must reference an active municipal category.",
  "instance": "/api/v1/citizen/issues",
  "timestamp": "2026-09-11T06:45:00.000Z",
  "errors": [
    {
      "field": "categoryId",
      "rule": "exists_in_database",
      "message": "Category ID 999 does not exist."
    },
    {
      "field": "latitude",
      "rule": "range_check",
      "message": "Latitude must be within municipal boundaries (37.7000 to 37.8500)."
    }
  ]
}
```

---

## 4. Role-Based Access Control (RBAC) Matrix

| Role | Description | Allowed Endpoints |
|:---|:---|:---|
| `PUBLIC` | Anonymous citizen visiting portal | Public Feed, Map, Filter, Search, Track Status |
| `CITIZEN` | Verified resident with phone/email | Auth, Create Issue, Upload Photo, Get My Issues, Update Own Issue, Add Comment, Notifications |
| `FIELD_WORKER` | Municipal crew or contracted technician | View Assigned Work Orders, Update Work Status, Upload Resolution Proof |
| `DISPATCHER` | Operations desk allocating crews | View All Issues, Verify Issue, Assign Field Worker, Update Status, Add Internal Note |
| `SUPERVISOR` | Ward council or department head | All Dispatcher actions + Reject Issue, Approve Resolution Proof, Department Analytics |
| `ADMIN` | System administrator | Full bypass access across all routes, user management, and system logs |

---

## 5. Authentication API

### 5.1 Register
- **Endpoint**: `/api/v1/auth/register`
- **HTTP Method**: `POST`
- **Description**: Registers a new citizen or municipal user with password hashing (bcrypt, 12 rounds) and creates an initial profile.
- **Authentication**: None (Public)
- **Required Role**: None
- **Path Variables**: None
- **Query Parameters**: None
- **Request Body**:
```json
{
  "fullName": "Maya Lin",
  "email": "maya.lin@civicmail.org",
  "password": "SecurePassword123!",
  "phoneNumber": "+1-555-019-2834",
  "role": "CITIZEN",
  "councilWard": 4
}
```
- **Validation Rules**:
  - `fullName`: Required, string, 2-100 characters, letters, spaces, hyphens only.
  - `email`: Required, valid email format (RFC 5322), unique in `users` table.
  - `password`: Required, string, min 8 characters, must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special symbol.
  - `phoneNumber`: Optional, valid E.164 phone format.
  - `role`: Optional (Defaults to `CITIZEN`). Non-admin users cannot register as `ADMIN` or `SUPERVISOR`.
  - `councilWard`: Optional, integer between 1 and 20.
- **Success Response**: `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully. Confirmation email sent.",
  "data": {
    "user": {
      "id": 142,
      "fullName": "Maya Lin",
      "email": "maya.lin@civicmail.org",
      "role": "CITIZEN",
      "councilWard": 4,
      "isVerified": false,
      "createdAt": "2026-09-11T06:45:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "tokenType": "Bearer",
      "expiresIn": 900
    }
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Missing required fields or malformed JSON syntax.
  - `409 Conflict`: An account with this email address already exists.
  - `422 Unprocessable Entity`: Password complexity requirement not met.
- **HTTP Status Codes**: `201`, `400`, `409`, `422`, `500`

---

### 5.2 Login
- **Endpoint**: `/api/v1/auth/login`
- **HTTP Method**: `POST`
- **Description**: Authenticates user credentials via bcrypt verification and issues a 15-minute JWT Access Token in the response body along with an HTTP-only secure Refresh Token cookie (7-day validity).
- **Authentication**: None (Public)
- **Required Role**: None
- **Path Variables**: None
- **Query Parameters**: None
- **Request Body**:
```json
{
  "email": "maya.lin@civicmail.org",
  "password": "SecurePassword123!"
}
```
- **Validation Rules**:
  - `email`: Required, non-empty, valid email string.
  - `password`: Required, non-empty string.
- **Success Response**: `200 OK` (Sets `Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth`)
```json
{
  "success": true,
  "message": "Authentication successful.",
  "data": {
    "user": {
      "id": 142,
      "fullName": "Maya Lin",
      "email": "maya.lin@civicmail.org",
      "role": "CITIZEN",
      "department": null,
      "badgeNumber": null,
      "councilWard": 4
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0Miwicm9sZSI6IkNJVElaRU4iLCJlbWFpbCI6Im1heWEubGluQGNpdmljbWFpbC5vcmciLCJpYXQiOjE3ODkxNDQzMDAsImV4cCI6MTc4OTE0NTIwMH0...",
      "tokenType": "Bearer",
      "expiresIn": 900
    }
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Email and password fields must not be empty.
  - `401 Unauthorized`: Invalid email or password provided.
  - `429 Too Many Requests`: Account temporarily locked after 5 consecutive failed attempts (rate limited for 15 minutes).
- **HTTP Status Codes**: `200`, `400`, `401`, `429`, `500`

---

### 5.3 Logout
- **Endpoint**: `/api/v1/auth/logout`
- **HTTP Method**: `POST`
- **Description**: Invalidates the active refresh token in the database session store and clears the client's HTTP-only cookie.
- **Authentication**: Bearer JWT (Required)
- **Required Role**: Any authenticated (`CITIZEN`, `FIELD_WORKER`, `DISPATCHER`, `SUPERVISOR`, `ADMIN`)
- **Path Variables**: None
- **Query Parameters**: None
- **Request Body**: None (Optional `{ "refreshToken": "..." }` if not using cookies)
- **Validation Rules**: Header `Authorization: Bearer <valid_jwt>` must be present.
- **Success Response**: `200 OK` (Sets `Set-Cookie: refreshToken=; Max-Age=0; Path=/api/v1/auth`)
```json
{
  "success": true,
  "message": "Session terminated successfully. Token invalidated."
}
```
- **Error Responses**:
  - `401 Unauthorized`: Missing or expired access token.
- **HTTP Status Codes**: `200`, `401`, `500`

---

### 5.4 Refresh Token
- **Endpoint**: `/api/v1/auth/refresh-token`
- **HTTP Method**: `POST`
- **Description**: Exchanges a valid, unrevoked Refresh Token (read from HTTP-only cookie or request body) for a brand new 15-minute JWT Access Token with automatic token rotation.
- **Authentication**: Refresh Token (Cookie or Body)
- **Required Role**: None
- **Path Variables**: None
- **Query Parameters**: None
- **Request Body**:
```json
{
  "refreshToken": "d8f3e2a1-7c4b-4f9e-9a1d-2b3c4d5e6f7a"
}
```
- **Validation Rules**:
  - `refreshToken`: Required string (if not supplied via cookie header). Must exist and match active database token hash.
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "message": "Token refreshed successfully.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 900
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Refresh token missing.
  - `401 Unauthorized`: Refresh token expired or revoked.
  - `403 Forbidden`: Token reuse detected — security alarm triggered, all active user sessions revoked.
- **HTTP Status Codes**: `200`, `400`, `401`, `403`, `500`

---

### 5.5 Current User Profile
- **Endpoint**: `/api/v1/auth/me`
- **HTTP Method**: `GET`
- **Description**: Returns the comprehensive profile of the authenticated user, including role entitlements, department affiliation, and activity counters.
- **Authentication**: Bearer JWT (Required)
- **Required Role**: Any authenticated role
- **Path Variables**: None
- **Query Parameters**: None
- **Request Body**: None
- **Validation Rules**: Valid Bearer Token in `Authorization` header.
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 142,
    "fullName": "Maya Lin",
    "email": "maya.lin@civicmail.org",
    "phoneNumber": "+1-555-019-2834",
    "role": "CITIZEN",
    "councilWard": 4,
    "department": null,
    "badgeNumber": null,
    "stats": {
      "totalReportedIssues": 8,
      "resolvedIssues": 6,
      "pendingIssues": 2,
      "totalUpvotesReceived": 42
    },
    "createdAt": "2026-09-11T06:45:00.000Z"
  }
}
```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid Bearer token.
  - `404 Not Found`: User record no longer exists.
- **HTTP Status Codes**: `200`, `401`, `404`, `500`

---

## 6. Citizen Grievance API

### 6.1 Create Issue
- **Endpoint**: `/api/v1/citizen/issues`
- **HTTP Method**: `POST`
- **Description**: Logs a new municipal grievance with geo-coordinates, street address, category, and automatic SLA turnaround calculation based on category weighting.
- **Authentication**: Bearer JWT (Required)
- **Required Role**: `CITIZEN` (or municipal staff)
- **Path Variables**: None
- **Query Parameters**: None
- **Request Body**:
```json
{
  "categoryId": 1,
  "title": "Severe Water Main Rupture Flooding Intersection",
  "description": "Continuous high-volume clean water surging through pavement fractures. Roadway substructure eroding rapidly.",
  "priority": "HIGH",
  "address": "742 Evergreen Terrace, Sector 4",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "councilWard": 4,
  "landmark": "Directly opposite Central Elementary School gates",
  "isPublic": true
}
```
- **Validation Rules**:
  - `categoryId`: Required, positive integer, must correspond to an active row in `issue_categories`.
  - `title`: Required, string, 10 to 150 characters.
  - `description`: Required, string, 20 to 2000 characters.
  - `priority`: Optional enum (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`). Defaults to category's `defaultPriority`.
  - `address`: Required, string, 5 to 255 characters.
  - `latitude`: Required, float between `-90.000000` and `90.000000`. Must be within municipal GIS boundary.
  - `longitude`: Required, float between `-180.000000` and `180.000000`. Must be within municipal GIS boundary.
  - `councilWard`: Required, integer between 1 and 20.
  - `landmark`: Optional, string up to 200 characters.
  - `isPublic`: Optional boolean (default `true`).
- **Success Response**: `201 Created`
```json
{
  "success": true,
  "message": "Grievance logged successfully and queued for dispatch.",
  "data": {
    "id": 894,
    "issueCode": "CVX-2026-08142",
    "title": "Severe Water Main Rupture Flooding Intersection",
    "status": "REPORTED",
    "priority": "HIGH",
    "category": {
      "id": 1,
      "code": "WATER_SEWER",
      "name": "Water & Sewage",
      "targetDepartment": "Department of Public Works - Water Distribution"
    },
    "location": {
      "address": "742 Evergreen Terrace, Sector 4",
      "latitude": 37.7749,
      "longitude": -122.4194,
      "councilWard": 4,
      "landmark": "Directly opposite Central Elementary School gates"
    },
    "slaDeadline": "2026-09-12T06:45:00.000Z",
    "slaHours": 24,
    "upvoteCount": 1,
    "commentCount": 0,
    "createdAt": "2026-09-11T06:45:00.000Z"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Payload validation error (e.g., coordinates out of range).
  - `401 Unauthorized`: Authentication token missing or invalid.
  - `422 Unprocessable Entity`: Referenced category ID inactive or non-existent.
- **HTTP Status Codes**: `201`, `400`, `401`, `422`, `500`

---

### 6.2 Upload Issue Photo
- **Endpoint**: `/api/v1/issues/:id/photos`
- **HTTP Method**: `POST`
- **Description**: Uploads visual photographic evidence via `multipart/form-data`. Server extracts camera EXIF metadata (GPS, timestamp), verifies geographic proximity to reported coordinates, computes SHA-256 deduplication hash, and persists image to object storage.
- **Authentication**: Bearer JWT (Required)
- **Required Role**: `CITIZEN` (must be author) or `DISPATCHER` / `ADMIN`
- **Path Variables**:
  - `id`: Positive integer (Issue ID)
- **Query Parameters**: None
- **Request Body**: `multipart/form-data`
  - `file`: Binary file stream (JPEG, PNG, WebP; max 10MB)
  - `caption`: String (Optional, max 200 characters)
  - `displayOrder`: Integer (Optional, 1 to 5)
- **Validation Rules**:
  - `id`: Valid existing issue ID.
  - `file`: Required. Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`. Maximum size: 10,485,760 bytes (10MB).
  - Max 5 photos per issue.
- **Success Response**: `201 Created`
```json
{
  "success": true,
  "message": "Evidence photo uploaded and verified.",
  "data": {
    "photoId": 2048,
    "issueId": 894,
    "photoUrl": "https://storage.civicfix.city.gov/evidence/2026/09/cvx-894-photo-1.jpg",
    "thumbnailUrl": "https://storage.civicfix.city.gov/evidence/2026/09/cvx-894-photo-1-thumb.jpg",
    "fileSizeBytes": 2450890,
    "mimeType": "image/jpeg",
    "sha256Hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "exifMetadata": {
      "cameraMake": "Apple",
      "cameraModel": "iPhone 15 Pro",
      "capturedAt": "2026-09-11T06:40:12.000Z",
      "gpsLat": 37.774912,
      "gpsLng": -122.419405,
      "isLocationVerified": true,
      "distanceMeters": 1.4
    },
    "caption": "Pavement collapse revealing eroded gravel sub-base",
    "displayOrder": 1,
    "createdAt": "2026-09-11T06:46:00.000Z"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: No file uploaded or invalid form field.
  - `401 Unauthorized`: Missing or invalid Bearer token.
  - `403 Forbidden`: User is not the author of this issue and lacks admin privileges.
  - `404 Not Found`: Issue ID not found.
  - `413 Payload Too Large`: Uploaded file exceeds 10MB limit.
  - `415 Unsupported Media Type`: File is not a valid JPEG/PNG/WebP image.
- **HTTP Status Codes**: `201`, `400`, `401`, `403`, `404`, `413`, `415`, `500`

---

### 6.3 Get My Issues
- **Endpoint**: `/api/v1/citizen/issues`
- **HTTP Method**: `GET`
- **Description**: Fetches a paginated list of all complaints filed by the currently authenticated citizen, with latest status indicators and SLA countdowns.
- **Authentication**: Bearer JWT (Required)
- **Required Role**: `CITIZEN`
- **Path Variables**: None
- **Query Parameters**:
  - `page`: Integer, default `1`, min `1`
  - `limit`: Integer, default `10`, min `1`, max `50`
  - `status`: String enum (`REPORTED`, `VERIFIED`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `REJECTED`)
  - `sortBy`: String (`createdAt`, `updatedAt`, `slaDeadline`), default `createdAt`
  - `sortOrder`: String (`asc`, `desc`), default `desc`
- **Request Body**: None
- **Validation Rules**: Parameter type and bounds validation.
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 894,
        "issueCode": "CVX-2026-08142",
        "title": "Severe Water Main Rupture Flooding Intersection",
        "categoryName": "Water & Sewage",
        "categoryCode": "WATER_SEWER",
        "status": "REPORTED",
        "priority": "HIGH",
        "address": "742 Evergreen Terrace, Sector 4",
        "councilWard": 4,
        "photosCount": 2,
        "upvoteCount": 14,
        "commentCount": 3,
        "slaDeadline": "2026-09-12T06:45:00.000Z",
        "isSlaBreached": false,
        "createdAt": "2026-09-11T06:45:00.000Z",
        "updatedAt": "2026-09-11T06:46:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 10,
      "totalItems": 1,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```
- **Error Responses**:
  - `401 Unauthorized`: Token missing or invalid.
  - `400 Bad Request`: Invalid pagination or sorting parameter.
- **HTTP Status Codes**: `200`, `400`, `401`, `500`

---

### 6.4 Get Issue Details
- **Endpoint**: `/api/v1/issues/:id`
- **HTTP Method**: `GET`
- **Description**: Returns complete details of a specific issue. Public viewers see general fields, citizen authors see their own metadata, and municipal staff see assigned personnel and internal notes.
- **Authentication**: Optional (JWT enhances permissions)
- **Required Role**: Any (or Public)
- **Path Variables**:
  - `id`: Positive integer (Issue ID)
- **Query Parameters**: None
- **Request Body**: None
- **Validation Rules**: `id` must be a valid positive integer.
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 894,
    "issueCode": "CVX-2026-08142",
    "title": "Severe Water Main Rupture Flooding Intersection",
    "description": "Continuous high-volume clean water surging through pavement fractures. Roadway substructure eroding rapidly.",
    "status": "ASSIGNED",
    "priority": "HIGH",
    "category": {
      "id": 1,
      "name": "Water & Sewage",
      "code": "WATER_SEWER",
      "slaHours": 24,
      "targetDepartment": "Department of Public Works - Water Distribution"
    },
    "location": {
      "address": "742 Evergreen Terrace, Sector 4",
      "latitude": 37.7749,
      "longitude": -122.4194,
      "councilWard": 4,
      "landmark": "Directly opposite Central Elementary School gates"
    },
    "reporter": {
      "id": 142,
      "fullName": "Maya Lin",
      "role": "CITIZEN"
    },
    "photos": [
      {
        "id": 2048,
        "photoUrl": "https://storage.civicfix.city.gov/evidence/2026/09/cvx-894-photo-1.jpg",
        "thumbnailUrl": "https://storage.civicfix.city.gov/evidence/2026/09/cvx-894-photo-1-thumb.jpg",
        "caption": "Pavement collapse revealing eroded gravel sub-base",
        "isLocationVerified": true
      }
    ],
    "assignments": [
      {
        "id": 412,
        "workerName": "Carlos Mendoza",
        "badgeNumber": "DPW-TECH-882",
        "departmentName": "Department of Public Works - Water Distribution",
        "deadline": "2026-09-12T06:45:00.000Z",
        "assignmentStatus": "ASSIGNED"
      }
    ],
    "resolutionProof": null,
    "upvoteCount": 14,
    "commentCount": 3,
    "slaDeadline": "2026-09-12T06:45:00.000Z",
    "createdAt": "2026-09-11T06:45:00.000Z",
    "updatedAt": "2026-09-11T07:15:00.000Z"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Invalid issue ID parameter.
  - `404 Not Found`: Issue with specified ID does not exist.
- **HTTP Status Codes**: `200`, `400`, `404`, `500`

---

### 6.5 Update Allowed Issue Information
- **Endpoint**: `/api/v1/citizen/issues/:id`
- **HTTP Method**: `PATCH`
- **Description**: Permits the citizen author to update non-structural descriptive information (clarifying descriptions, additional landmark details, contact phone) provided the issue has not yet been transitioned past `REPORTED` or `VERIFIED`.
- **Authentication**: Bearer JWT (Required)
- **Required Role**: `CITIZEN` (must be author of the issue)
- **Path Variables**:
  - `id`: Positive integer (Issue ID)
- **Query Parameters**: None
- **Request Body**:
```json
{
  "description": "Continuous high-volume clean water surging through pavement fractures. Roadway substructure eroding rapidly. Flow has doubled since 7:00 AM.",
  "landmark": "Directly opposite Central Elementary School gates, beside Hydrant #B4",
  "contactPhone": "+1-555-019-2834"
}
```
- **Validation Rules**:
  - `id`: Issue must be in `REPORTED` or `VERIFIED` state. Citizens cannot edit issues in `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, or `CLOSED`.
  - Citizens are strictly forbidden from modifying `status`, `priority`, `categoryId`, or GPS `latitude`/`longitude`.
  - `description`: Optional string, 20 to 2000 characters.
  - `landmark`: Optional string, max 200 characters.
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "message": "Issue details updated successfully.",
  "data": {
    "id": 894,
    "description": "Continuous high-volume clean water surging through pavement fractures. Roadway substructure eroding rapidly. Flow has doubled since 7:00 AM.",
    "landmark": "Directly opposite Central Elementary School gates, beside Hydrant #B4",
    "updatedAt": "2026-09-11T07:30:00.000Z"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Attempting to modify restricted fields (e.g. `status`, `priority`).
  - `401 Unauthorized`: Token missing or invalid.
  - `403 Forbidden`: Authenticated user is not the reporter of this grievance.
  - `404 Not Found`: Issue not found.
  - `409 Conflict`: Cannot edit issue because it is already `IN_PROGRESS` or `RESOLVED`.
- **HTTP Status Codes**: `200`, `400`, `401`, `403`, `404`, `409`, `500`

---

### 6.6 Add Comment
- **Endpoint**: `/api/v1/issues/:id/comments`
- **HTTP Method**: `POST`
- **Description**: Appends a community comment or resident query to an issue. Automated spam filters and profanity sanitizers process the input.
- **Authentication**: Bearer JWT (Required)
- **Required Role**: `CITIZEN`, `FIELD_WORKER`, `DISPATCHER`, `SUPERVISOR`, `ADMIN`
- **Path Variables**:
  - `id`: Positive integer (Issue ID)
- **Query Parameters**: None
- **Request Body**:
```json
{
  "content": "Water is now reaching the school driveway sidewalk. Kids are arriving for morning care."
}
```
- **Validation Rules**:
  - `id`: Valid issue ID.
  - `content`: Required, string, 3 to 1000 characters. Must not be empty or whitespace-only.
- **Success Response**: `201 Created`
```json
{
  "success": true,
  "message": "Comment posted successfully.",
  "data": {
    "commentId": 512,
    "issueId": 894,
    "author": {
      "id": 142,
      "fullName": "Maya Lin",
      "role": "CITIZEN"
    },
    "content": "Water is now reaching the school driveway sidewalk. Kids are arriving for morning care.",
    "isInternalNote": false,
    "createdAt": "2026-09-11T07:35:00.000Z"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Blank or invalid content string.
  - `401 Unauthorized`: Missing authentication.
  - `404 Not Found`: Issue not found.
  - `422 Unprocessable Entity`: Comment failed automated moderation check.
- **HTTP Status Codes**: `201`, `400`, `401`, `404`, `422`, `500`

---

### 6.7 Track Status by Code
- **Endpoint**: `/api/v1/issues/track/:issueCode`
- **HTTP Method**: `GET`
- **Description**: Fast, unauthenticated public lookup endpoint allowing any citizen to enter their SMS/email ticket tracking code (e.g. `CVX-2026-08142`) and view the live municipal workflow state machine, SLA countdown, and audit timeline.
- **Authentication**: None (Public)
- **Required Role**: None
- **Path Variables**:
  - `issueCode`: String matching regex `^CVX-\d{4}-\d{5}$` (e.g. `CVX-2026-08142`)
- **Query Parameters**: None
- **Request Body**: None
- **Validation Rules**: `issueCode` must strictly match the municipal tracking format.
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "issueCode": "CVX-2026-08142",
    "title": "Severe Water Main Rupture Flooding Intersection",
    "currentStatus": "ASSIGNED",
    "statusBadge": {
      "label": "Assigned to Crew",
      "color": "#3B82F6",
      "step": 3,
      "totalSteps": 5
    },
    "departmentAssigned": "Department of Public Works - Water Distribution",
    "slaCountdown": {
      "deadline": "2026-09-12T06:45:00.000Z",
      "hoursRemaining": 23.2,
      "isBreached": false
    },
    "timeline": [
      {
        "status": "REPORTED",
        "timestamp": "2026-09-11T06:45:00.000Z",
        "notes": "Citizen grievance registered via portal."
      },
      {
        "status": "VERIFIED",
        "timestamp": "2026-09-11T07:00:00.000Z",
        "notes": "Dispatcher verified severity and confirmed municipal water main jurisdiction."
      },
      {
        "status": "ASSIGNED",
        "timestamp": "2026-09-11T07:15:00.000Z",
        "notes": "Work order dispatched to Crew Tech Carlos Mendoza."
      }
    ]
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Invalid issue code format. Must match `CVX-YYYY-XXXXX`.
  - `404 Not Found`: No civic complaint found matching this tracking code.
- **HTTP Status Codes**: `200`, `400`, `404`, `500`

---

### 6.8 Receive Notifications
- **Endpoint**: `/api/v1/notifications`
- **HTTP Method**: `GET`
- **Description**: Fetches all notifications, SMS dispatch receipts, and SLA warnings targeted to the authenticated user.
- **Authentication**: Bearer JWT (Required)
- **Required Role**: Any authenticated role
- **Path Variables**: None
- **Query Parameters**:
  - `unreadOnly`: Boolean (`true` | `false`), default `false`
  - `page`: Integer, default `1`
  - `limit`: Integer, default `20`, max `50`
- **Request Body**: None
- **Validation Rules**: `unreadOnly` must be boolean string.
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 7891,
        "title": "Status Update: CVX-2026-08142",
        "message": "Your report 'Water Main Rupture' has been assigned to Carlos Mendoza (DPW). Scheduled repair in progress.",
        "notificationType": "STATUS_UPDATE",
        "deliveryChannel": "IN_APP",
        "isRead": false,
        "relatedIssueId": 894,
        "issueCode": "CVX-2026-08142",
        "createdAt": "2026-09-11T07:15:00.000Z"
      }
    ],
    "unreadCount": 1,
    "pagination": {
      "currentPage": 1,
      "pageSize": 20,
      "totalItems": 1,
      "totalPages": 1
    }
  }
}
```
- **Error Responses**:
  - `401 Unauthorized`: Token missing or invalid.
- **HTTP Status Codes**: `200`, `401`, `500`

---

## 7. Public & Transparency API

### 7.1 View Civic Issues Feed
- **Endpoint**: `/api/v1/public/issues`
- **HTTP Method**: `GET`
- **Description**: Serves a publicly consumable feed of civic issues. Reporter personal identifiers are sanitized for privacy while preserving geographic and civic accountability data.
- **Authentication**: None (Public)
- **Required Role**: None
- **Path Variables**: None
- **Query Parameters**:
  - `page`: Integer, default `1`
  - `limit`: Integer, default `15`, max `50`
  - `sortBy`: String (`latest`, `upvotes`, `urgent`), default `latest`
- **Request Body**: None
- **Validation Rules**: Standard pagination limits.
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 894,
        "issueCode": "CVX-2026-08142",
        "title": "Severe Water Main Rupture Flooding Intersection",
        "categoryName": "Water & Sewage",
        "categoryCode": "WATER_SEWER",
        "status": "ASSIGNED",
        "priority": "HIGH",
        "address": "742 Evergreen Terrace, Sector 4",
        "councilWard": 4,
        "upvoteCount": 14,
        "commentCount": 3,
        "photos": [
          {
            "thumbnailUrl": "https://storage.civicfix.city.gov/evidence/2026/09/cvx-894-photo-1-thumb.jpg"
          }
        ],
        "slaDeadline": "2026-09-12T06:45:00.000Z",
        "createdAt": "2026-09-11T06:45:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 15,
      "totalItems": 184,
      "totalPages": 13,
      "hasNextPage": true
    }
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Invalid pagination or sorting parameter.
- **HTTP Status Codes**: `200`, `400`, `500`

---

### 7.2 View Issue Map (GeoJSON)
- **Endpoint**: `/api/v1/public/issues/map`
- **HTTP Method**: `GET`
- **Description**: Returns lightweight geospatial data formatted as an OGC standard GeoJSON `FeatureCollection` for direct rendering on Leaflet and OpenStreetMap. Supports spatial bounding box filtering.
- **Authentication**: None (Public)
- **Required Role**: None
- **Path Variables**: None
- **Query Parameters**:
  - `minLat`: Float (Latitude minimum bound)
  - `maxLat`: Float (Latitude maximum bound)
  - `minLng`: Float (Longitude minimum bound)
  - `maxLng`: Float (Longitude maximum bound)
  - `status`: String enum (Optional filter)
  - `categoryId`: Integer (Optional filter)
  - `ward`: Integer (Optional filter)
- **Request Body**: None
- **Validation Rules**:
  - `minLat`, `maxLat`: Range between `-90.0` and `90.0`. `minLat <= maxLat`.
  - `minLng`, `maxLng`: Range between `-180.0` and `180.0`. `minLng <= maxLng`.
- **Success Response**: `200 OK`
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-122.4194, 37.7749]
      },
      "properties": {
        "id": 894,
        "issueCode": "CVX-2026-08142",
        "title": "Severe Water Main Rupture Flooding Intersection",
        "status": "ASSIGNED",
        "priority": "HIGH",
        "category": "Water & Sewage",
        "categoryCode": "WATER_SEWER",
        "councilWard": 4,
        "thumbnailUrl": "https://storage.civicfix.city.gov/evidence/2026/09/cvx-894-photo-1-thumb.jpg",
        "upvoteCount": 14,
        "createdAt": "2026-09-11T06:45:00.000Z"
      }
    }
  ]
}
```
- **Error Responses**:
  - `400 Bad Request`: Malformed bounding box parameters.
- **HTTP Status Codes**: `200`, `400`, `500`

---

### 7.3 Filter Issues
- **Endpoint**: `/api/v1/public/issues/filter`
- **HTTP Method**: `GET`
- **Description**: Multi-parameter query endpoint allowing citizens and researchers to drill down into municipal issues by status, department, ward, date range, and resolution status.
- **Authentication**: None (Public)
- **Required Role**: None
- **Path Variables**: None
- **Query Parameters**:
  - `status`: String enum (`REPORTED`, `VERIFIED`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `REJECTED`)
  - `categoryId`: Integer
  - `councilWard`: Integer (1-20)
  - `priority`: String enum (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
  - `startDate`: ISO 8601 date string (e.g., `2026-09-01`)
  - `endDate`: ISO 8601 date string (e.g., `2026-09-11`)
  - `hasResolutionProof`: Boolean (`true` | `false`)
  - `page`: Integer, default `1`
  - `limit`: Integer, default `15`
- **Request Body**: None
- **Validation Rules**: `startDate` must precede or equal `endDate`.
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "filtersApplied": {
    "status": "RESOLVED",
    "councilWard": 4,
    "categoryId": 1
  },
  "data": {
    "items": [
      {
        "id": 810,
        "issueCode": "CVX-2026-07921",
        "title": "Low Pressure Water Line Leak",
        "status": "RESOLVED",
        "priority": "MEDIUM",
        "councilWard": 4,
        "resolutionTimeHours": 18.5,
        "resolvedAt": "2026-09-08T14:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 15,
      "totalItems": 1,
      "totalPages": 1
    }
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Invalid filter parameters or date syntax.
- **HTTP Status Codes**: `200`, `400`, `500`

---

### 7.4 Search Issues
- **Endpoint**: `/api/v1/public/issues/search`
- **HTTP Method**: `GET`
- **Description**: Full-text and phonetic search across complaint titles, descriptions, street addresses, and landmarks.
- **Authentication**: None (Public)
- **Required Role**: None
- **Path Variables**: None
- **Query Parameters**:
  - `q`: Required string, search term, min 2 chars, max 100 chars
  - `page`: Integer, default `1`
  - `limit`: Integer, default `10`
- **Request Body**: None
- **Validation Rules**: `q` must contain at least 2 non-whitespace characters.
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "query": "water main evergreen",
  "data": {
    "items": [
      {
        "id": 894,
        "issueCode": "CVX-2026-08142",
        "title": "Severe Water Main Rupture Flooding Intersection",
        "address": "742 Evergreen Terrace, Sector 4",
        "status": "ASSIGNED",
        "relevanceScore": 0.94
      }
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 10,
      "totalItems": 1,
      "totalPages": 1
    }
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Search query `q` missing or shorter than 2 characters.
- **HTTP Status Codes**: `200`, `400`, `500`

---

## 8. Administrative & Dispatcher Operations API

### 8.1 Get All Issues
- **Endpoint**: `/api/v1/admin/issues`
- **HTTP Method**: `GET`
- **Description**: Master municipal control grid returning issues with internal dispatch records, SLA breach flags, assigned field crews, and financial cost tallies.
- **Authentication**: Bearer JWT (Required)
- **Required Role**: `DISPATCHER`, `SUPERVISOR`, `ADMIN`
- **Path Variables**: None
- **Query Parameters**:
  - `page`: Integer, default `1`
  - `limit`: Integer, default `25`, max `100`
  - `status`: String enum
  - `department`: String
  - `slaBreachedOnly`: Boolean (`true` | `false`)
  - `councilWard`: Integer
  - `assignedWorkerId`: Integer
- **Request Body**: None
- **Validation Rules**: User role must be in `['DISPATCHER', 'SUPERVISOR', 'ADMIN']`.
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 894,
        "issueCode": "CVX-2026-08142",
        "title": "Severe Water Main Rupture Flooding Intersection",
        "categoryName": "Water & Sewage",
        "targetDepartment": "Department of Public Works - Water Distribution",
        "status": "ASSIGNED",
        "priority": "HIGH",
        "reporter": {
          "id": 142,
          "fullName": "Maya Lin",
          "phone": "+1-555-019-2834"
        },
        "assignedTo": {
          "workerId": 32,
          "workerName": "Carlos Mendoza",
          "badge": "DPW-TECH-882"
        },
        "councilWard": 4,
        "slaDeadline": "2026-09-12T06:45:00.000Z",
        "isSlaBreached": false,
        "hoursUntilSlaBreach": 23.2,
        "createdAt": "2026-09-11T06:45:00.000Z"
      }
    ],
    "metrics": {
      "totalOpen": 47,
      "slaBreachedCount": 3,
      "unassignedCount": 8
    },
    "pagination": {
      "currentPage": 1,
      "pageSize": 25,
      "totalItems": 47,
      "totalPages": 2
    }
  }
}
```
- **Error Responses**:
  - `401 Unauthorized`: Token missing or invalid.
  - `403 Forbidden`: Insufficient role permissions.
- **HTTP Status Codes**: `200`, `401`, `403`, `500`

---

### 8.2 Verify Issue
- **Endpoint**: `/api/v1/admin/issues/:id/verify`
- **HTTP Method**: `PATCH`
- **Description**: Supervisor or Dispatcher verification gate confirming that a newly filed report is legitimate, within municipal jurisdiction, and not a duplicate. Advances status from `REPORTED` to `VERIFIED`.
- **Authentication**: Bearer JWT (Required)
- **Required Role**: `DISPATCHER`, `SUPERVISOR`, `ADMIN`
- **Path Variables**:
  - `id`: Positive integer (Issue ID)
- **Query Parameters**: None
- **Request Body**:
```json
{
  "verificationNotes": "Confirmed municipal water main pipe #WM-404. High volume flow presents immediate hazard to school traffic.",
  "adjustedPriority": "HIGH"
}
```
- **Validation Rules**:
  - `id`: Target issue must currently be in `REPORTED` status.
  - `verificationNotes`: Required, string, 5 to 500 characters.
  - `adjustedPriority`: Optional enum (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "message": "Issue verified and approved for work dispatch.",
  "data": {
    "id": 894,
    "issueCode": "CVX-2026-08142",
    "status": "VERIFIED",
    "priority": "HIGH",
    "verifiedBy": {
      "userId": 5,
      "name": "Marcus Vance",
      "role": "DISPATCHER"
    },
    "verifiedAt": "2026-09-11T07:00:00.000Z"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Missing verification notes.
  - `401 Unauthorized`: Missing authentication.
  - `403 Forbidden`: User role is not `DISPATCHER`, `SUPERVISOR`, or `ADMIN`.
  - `404 Not Found`: Issue not found.
  - `409 Conflict`: Issue is not in `REPORTED` status (e.g., already verified or resolved).
- **HTTP Status Codes**: `200`, `400`, `401`, `403`, `404`, `409`, `500`

---

### 8.3 Assign Issue to Field Worker
- **Endpoint**: `/api/v1/admin/issues/:id/assign`
- **HTTP Method**: `POST`
- **Description**: Issues an official municipal work order dispatching a specific field technician or contracted crew to the civic complaint site.
- **Authentication**: Bearer JWT (Required)
- **Required Role**: `DISPATCHER`, `ADMIN`
- **Path Variables**:
  - `id`: Positive integer (Issue ID)
- **Query Parameters**: None
- **Request Body**:
```json
{
  "assignedToUserId": 32,
  "departmentName": "Department of Public Works - Water Distribution",
  "instructions": "Locate curb stop valve #SV-12. Isolate 8-inch main section and deploy vacuum hydro-excavator.",
  "scheduledStartTime": "2026-09-11T08:00:00.000Z",
  "deadlineHours": 24
}
```
- **Validation Rules**:
  - `id`: Issue must be in `VERIFIED` or `REPORTED` status.
  - `assignedToUserId`: Required, positive integer, user must have role `FIELD_WORKER` and be in active status.
  - `departmentName`: Required, string, 3 to 100 characters.
  - `instructions`: Required, string, 10 to 1000 characters.
  - `deadlineHours`: Required, integer between 1 and 168 (max 7 days).
- **Success Response**: `201 Created`
```json
{
  "success": true,
  "message": "Work order dispatched successfully. Field crew notified.",
  "data": {
    "assignmentId": 412,
    "issueId": 894,
    "issueCode": "CVX-2026-08142",
    "assignedWorker": {
      "id": 32,
      "fullName": "Carlos Mendoza",
      "badgeNumber": "DPW-TECH-882",
      "role": "FIELD_WORKER"
    },
    "departmentName": "Department of Public Works - Water Distribution",
    "instructions": "Locate curb stop valve #SV-12. Isolate 8-inch main section and deploy vacuum hydro-excavator.",
    "deadline": "2026-09-12T07:15:00.000Z",
    "assignmentStatus": "ASSIGNED",
    "dispatchedAt": "2026-09-11T07:15:00.000Z"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Invalid payload parameters.
  - `401 Unauthorized`: Token missing or invalid.
  - `403 Forbidden`: Only Dispatchers and Administrators can issue work orders.
  - `404 Not Found`: Issue ID or Field Worker User ID not found.
  - `409 Conflict`: Cannot assign an issue that has already been `RESOLVED` or `CLOSED`.
- **HTTP Status Codes**: `201`, `400`, `401`, `403`, `404`, `409`, `500`

---

### 8.4 Update Lifecycle Status
- **Endpoint**: `/api/v1/admin/issues/:id/status`
- **HTTP Method**: `PATCH`
- **Description**: Advances the issue through the municipal workflow state machine (`REPORTED` -> `VERIFIED` -> `ASSIGNED` -> `IN_PROGRESS` -> `RESOLVED` -> `CLOSED`). Every status transition creates an immutable audit record in `issue_status_history`.
- **Authentication**: Bearer JWT (Required)
- **Required Role**: `DISPATCHER`, `SUPERVISOR`, `FIELD_WORKER`, `ADMIN`
- **Path Variables**:
  - `id`: Positive integer (Issue ID)
- **Query Parameters**: None
- **Request Body**:
```json
{
  "status": "IN_PROGRESS",
  "reasonOrNotes": "Crew on site with hydro-excavation truck. Isolating line pressure.",
  "changeTrigger": "FIELD_CREW_CHECKIN"
}
```
- **Validation Rules**:
  - `id`: Valid issue ID.
  - `status`: Required enum (`VERIFIED`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`). Must follow legal state machine transitions.
  - Direct transition to `RESOLVED` requires pre-existing approved `resolution_proof`.
  - `reasonOrNotes`: Required, string, 5 to 500 characters.
  - `changeTrigger`: Required enum (`DISPATCHER_ACTION`, `FIELD_CREW_CHECKIN`, `FIELD_RESOLUTION`, `SUPERVISOR_AUDIT`, `AUTOMATED_SLA_BREACH`).
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "message": "Issue status updated successfully.",
  "data": {
    "issueId": 894,
    "issueCode": "CVX-2026-08142",
    "previousStatus": "ASSIGNED",
    "newStatus": "IN_PROGRESS",
    "changedBy": {
      "userId": 32,
      "name": "Carlos Mendoza",
      "role": "FIELD_WORKER"
    },
    "reasonOrNotes": "Crew on site with hydro-excavation truck. Isolating line pressure.",
    "updatedAt": "2026-09-11T08:10:00.000Z"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Invalid status value.
  - `401 Unauthorized`: Token missing or invalid.
  - `403 Forbidden`: User role not permitted to trigger this transition.
  - `404 Not Found`: Issue not found.
  - `409 Conflict`: Illegal status transition (e.g. attempting to resolve an issue without resolution proof).
- **HTTP Status Codes**: `200`, `400`, `401`, `403`, `404`, `409`, `500`

---

### 8.5 Reject Issue
- **Endpoint**: `/api/v1/admin/issues/:id/reject`
- **HTTP Method**: `PATCH`
- **Description**: Rejects an illegitimate, out-of-jurisdiction, duplicate, or private property grievance. Transitions status to `REJECTED`, creates an audit trail, and sends an official notification with the mandatory administrative explanation to the reporter.
- **Authentication**: Bearer JWT (Required)
- **Required Role**: `SUPERVISOR`, `ADMIN`
- **Path Variables**:
  - `id`: Positive integer (Issue ID)
- **Query Parameters**: None
- **Request Body**:
```json
{
  "rejectionReason": "PRIVATE_PROPERTY",
  "explanation": "Inspection determined the water leak originated within private residential plumbing behind the property line water meter, which falls outside municipal maintenance jurisdiction."
}
```
- **Validation Rules**:
  - `id`: Issue must be in `REPORTED` or `VERIFIED` status.
  - `rejectionReason`: Required enum (`DUPLICATE`, `OUT_OF_JURISDICTION`, `PRIVATE_PROPERTY`, `INSUFFICIENT_EVIDENCE`, `SPAM`).
  - `explanation`: Required, string, 15 to 1000 characters. Mandatory for citizen audit transparency.
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "message": "Grievance rejected. Notification sent to reporter.",
  "data": {
    "issueId": 894,
    "issueCode": "CVX-2026-08142",
    "status": "REJECTED",
    "rejectionReason": "PRIVATE_PROPERTY",
    "explanation": "Inspection determined the water leak originated within private residential plumbing behind the property line water meter, which falls outside municipal maintenance jurisdiction.",
    "rejectedBy": {
      "userId": 2,
      "name": "Sarah Jenkins",
      "role": "SUPERVISOR"
    },
    "rejectedAt": "2026-09-11T08:30:00.000Z"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Explanation missing or under 15 characters.
  - `401 Unauthorized`: Token missing or invalid.
  - `403 Forbidden`: Only Supervisors and Admins can formally reject civic grievances.
  - `404 Not Found`: Issue not found.
  - `409 Conflict`: Cannot reject an issue that is already `IN_PROGRESS`, `RESOLVED`, or `CLOSED`.
- **HTTP Status Codes**: `200`, `400`, `401`, `403`, `404`, `409`, `500`

---

### 8.6 Add Official Comment / Internal Note
- **Endpoint**: `/api/v1/admin/issues/:id/official-comments`
- **HTTP Method**: `POST`
- **Description**: Adds an official municipal status bulletin (visible to public) or a confidential internal operational note (`isInternalNote: true`, hidden from public/citizen view).
- **Authentication**: Bearer JWT (Required)
- **Required Role**: `DISPATCHER`, `SUPERVISOR`, `FIELD_WORKER`, `ADMIN`
- **Path Variables**:
  - `id`: Positive integer (Issue ID)
- **Query Parameters**: None
- **Request Body**:
```json
{
  "content": "Excavation revealed rupture on 8-inch cast iron pipe from 1954. Replacement sleeve clamped; asphalt crew scheduled for 2:00 PM paving.",
  "isInternalNote": false
}
```
- **Validation Rules**:
  - `id`: Valid issue ID.
  - `content`: Required, string, 5 to 2000 characters.
  - `isInternalNote`: Required boolean.
- **Success Response**: `201 Created`
```json
{
  "success": true,
  "message": "Official comment recorded.",
  "data": {
    "commentId": 732,
    "issueId": 894,
    "author": {
      "userId": 32,
      "fullName": "Carlos Mendoza",
      "role": "FIELD_WORKER",
      "department": "DPW - Water Distribution"
    },
    "content": "Excavation revealed rupture on 8-inch cast iron pipe from 1954. Replacement sleeve clamped; asphalt crew scheduled for 2:00 PM paving.",
    "isInternalNote": false,
    "createdAt": "2026-09-11T13:45:00.000Z"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Missing content.
  - `401 Unauthorized`: Token missing or invalid.
  - `403 Forbidden`: Citizens cannot post via this endpoint (must use `/api/v1/issues/:id/comments`).
  - `404 Not Found`: Issue not found.
- **HTTP Status Codes**: `201`, `400`, `401`, `403`, `404`, `500`

---

### 8.7 Upload Resolution Proof
- **Endpoint**: `/api/v1/admin/issues/:id/resolution-proof`
- **HTTP Method**: `POST`
- **Description**: Submits the post-repair evidence dossier. Includes the mandatory "After" photograph URL, itemized labor hours, materials expenditure, and field work summary. Automatically transitions the issue to `RESOLVED` and initiates supervisor sign-off workflow.
- **Authentication**: Bearer JWT (Required)
- **Required Role**: `FIELD_WORKER`, `SUPERVISOR`, `ADMIN`
- **Path Variables**:
  - `id`: Positive integer (Issue ID)
- **Query Parameters**: None
- **Request Body**:
```json
{
  "afterPhotoUrl": "https://storage.civicfix.city.gov/evidence/2026/09/cvx-894-resolved.jpg",
  "workDescription": "Replaced ruptured 8-inch cast-iron section with ductile iron sleeve, backfilled with gravel aggregate, compacted, and laid hot asphalt patch.",
  "laborHours": 4.5,
  "materialsCost": 680.50
}
```
- **Validation Rules**:
  - `id`: Issue must currently be in `IN_PROGRESS` or `ASSIGNED` status.
  - `afterPhotoUrl`: Required, valid URL pointing to uploaded verified resolution image.
  - `workDescription`: Required, string, 10 to 1000 characters.
  - `laborHours`: Required, float > 0.0 and <= 200.0.
  - `materialsCost`: Required, float >= 0.00 and <= 1,000,000.00.
- **Success Response**: `201 Created`
```json
{
  "success": true,
  "message": "Resolution proof logged successfully. Issue marked as RESOLVED.",
  "data": {
    "proofId": 98,
    "issueId": 894,
    "issueCode": "CVX-2026-08142",
    "status": "RESOLVED",
    "afterPhotoUrl": "https://storage.civicfix.city.gov/evidence/2026/09/cvx-894-resolved.jpg",
    "workDescription": "Replaced ruptured 8-inch cast-iron section with ductile iron sleeve, backfilled with gravel aggregate, compacted, and laid hot asphalt patch.",
    "laborHours": 4.5,
    "materialsCost": 680.50,
    "verificationStatus": "PENDING_REVIEW",
    "resolvedBy": {
      "userId": 32,
      "name": "Carlos Mendoza",
      "badge": "DPW-TECH-882"
    },
    "completedAt": "2026-09-11T16:30:00.000Z"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Missing photo URL or invalid financial numbers.
  - `401 Unauthorized`: Token missing or invalid.
  - `403 Forbidden`: User role is not authorized to submit repair proof.
  - `404 Not Found`: Issue not found.
  - `409 Conflict`: Resolution proof has already been submitted for this issue.
- **HTTP Status Codes**: `201`, `400`, `401`, `403`, `404`, `409`, `500`

---

### 8.8 View Dashboard Statistics
- **Endpoint**: `/api/v1/admin/dashboard/statistics`
- **HTTP Method**: `GET`
- **Description**: Computes high-level municipal operational telemetry: total volume of complaints, current resolution rate (%), average time-to-repair (MTTR in hours), SLA compliance rate, departmental breakdown, ward distribution, and total material costs.
- **Authentication**: Bearer JWT (Required)
- **Required Role**: `SUPERVISOR`, `ADMIN`
- **Path Variables**: None
- **Query Parameters**:
  - `timeframe`: String enum (`7d`, `30d`, `90d`, `year`), default `30d`
  - `councilWard`: Integer (Optional ward filter)
  - `department`: String (Optional department filter)
- **Request Body**: None
- **Validation Rules**: `timeframe` must be one of `['7d', '30d', '90d', 'year']`.
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "timeframe": "30d",
  "generatedAt": "2026-09-11T17:00:00.000Z",
  "data": {
    "summary": {
      "totalIssues": 342,
      "resolvedIssues": 298,
      "inProgressIssues": 28,
      "openUnassigned": 16,
      "resolutionRatePercentage": 87.13,
      "averageResolutionHours": 19.4,
      "slaCompliancePercentage": 94.2,
      "totalMaterialsExpended": 48250.75
    },
    "breakdownByCategory": [
      {
        "categoryCode": "ROADS_POTHOLES",
        "categoryName": "Roads & Potholes",
        "count": 142,
        "resolvedCount": 130,
        "avgHours": 16.2
      },
      {
        "categoryCode": "WATER_SEWER",
        "categoryName": "Water & Sewage",
        "count": 94,
        "resolvedCount": 85,
        "avgHours": 14.8
      },
      {
        "categoryCode": "STREET_LIGHTING",
        "categoryName": "Street Lighting",
        "count": 68,
        "resolvedCount": 58,
        "avgHours": 26.5
      },
      {
        "categoryCode": "PARKS_RECREATION",
        "categoryName": "Parks & Public Spaces",
        "count": 38,
        "resolvedCount": 25,
        "avgHours": 32.1
      }
    ],
    "breakdownByWard": [
      { "wardNumber": 1, "issuesCount": 42, "resolvedPercentage": 90.5 },
      { "wardNumber": 2, "issuesCount": 58, "resolvedPercentage": 86.2 },
      { "wardNumber": 3, "issuesCount": 84, "resolvedPercentage": 84.5 },
      { "wardNumber": 4, "issuesCount": 92, "resolvedPercentage": 89.1 },
      { "wardNumber": 5, "issuesCount": 66, "resolvedPercentage": 87.8 }
    ],
    "slaBreachWarnings": [
      {
        "issueId": 872,
        "issueCode": "CVX-2026-08119",
        "title": "Broken Traffic Signal on Main St",
        "hoursRemaining": 1.2,
        "assignedWorker": "Elena Torres"
      }
    ]
  }
}
```
- **Error Responses**:
  - `401 Unauthorized`: Token missing or invalid.
  - `403 Forbidden`: User role is not `SUPERVISOR` or `ADMIN`.
  - `400 Bad Request`: Invalid timeframe query parameter.
- **HTTP Status Codes**: `200`, `400`, `401`, `403`, `500`

---

## 9. Postman & OpenAPI Integration Guide

### 9.1 OpenAPI 3.1.0 Swagger YAML
The API specification is exported to `/docs/openapi.yaml` and accessible via Swagger UI at `/api/docs`.

### 9.2 Postman Collection Format
Import `civicfix-postman-collection.json` into Postman. The collection preconfigures:
- Global `{{base_url}}` variable pointing to `http://localhost:3000/api/v1`
- Pre-request script automatically obtaining and injecting `{{bearer_token}}` into `Authorization` headers
- Contract assertion tests verifying response status codes and RFC 7807 error envelopes
