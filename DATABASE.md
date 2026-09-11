# CivicFix — Phase 1: Database Architecture & Design Specification

> **Project:** CivicFix — Municipal Civic Issue Reporting, Field Dispatch, and Resolution Platform  
> **Phase:** Phase 1 — Database Design (Prompt 5)  
> **Author:** CivicFix Engineering & Database Architecture Team  
> **Target RDBMS:** MySQL 8.0+ (InnoDB Engine with Spatial/GIS Extensions)  
> **Backend Integration:** Java 21 / Spring Boot 3.x (Spring Data JPA / Hibernate)  
> **Frontend Stack:** React 19 / TypeScript / Tailwind CSS  

---

## Table of Contents
1. [Database Engine Decision: MySQL vs. MongoDB](#1-database-engine-decision-mysql-vs-mongodb)
2. [Entity-Relationship (ER) Diagram (Mermaid)](#2-entity-relationship-er-diagram-mermaid)
3. [Complete Entity Specifications](#3-complete-entity-specifications)
   - [3.1 Users](#31-users)
   - [3.2 Issue Categories](#32-issue-categories)
   - [3.3 Locations](#33-locations)
   - [3.4 Issues](#34-issues)
   - [3.5 Issue Photos](#35-issue-photos)
   - [3.6 Issue Status History](#36-issue-status-history)
   - [3.7 Assignments](#37-assignments)
   - [3.8 Notifications](#38-notifications)
   - [3.9 Comments](#39-comments)
   - [3.10 Resolution Proof](#310-resolution-proof)
4. [Relational Cardinality & Integrity Rules](#4-relational-cardinality--integrity-rules)
5. [Database Normalization Analysis](#5-database-normalization-analysis)
6. [Comprehensive Indexing Strategy](#6-comprehensive-indexing-strategy)
7. [Security & Compliance Architecture](#7-security--compliance-architecture)
8. [Sample Records (SQL & JSON Formats)](#8-sample-records-sql--json-formats)
9. [Java Spring Boot & DDL Schema Integration](#9-java-spring-boot--ddl-schema-integration)

---

## 1. Database Engine Decision: MySQL vs. MongoDB

Selecting the data persistence layer for a municipal civic tracking system requires balancing **data integrity, transactional consistency, auditability, spatial processing, and querying complexity**.

### Comparative Evaluation Matrix

| Architectural Criterion | MySQL 8.0+ (InnoDB) | MongoDB 7.0+ (Document Store) | CivicFix Requirement & Impact |
| :--- | :--- | :--- | :--- |
| **ACID Guarantees & Multi-Table Transactions** | **Native, strict ACID** at engine level with MVCC and robust isolation levels. | Multi-document ACID exists since v4.0 but with higher latency, memory overhead, and 60s timeout limits. | **CRITICAL**: Status transitions, worker dispatches, and resolution proof submissions must update status, append audit logs, and trigger notifications atomically. |
| **Referential Integrity & Constraints** | **Strict Foreign Keys** (`ON DELETE RESTRICT/CASCADE`), check constraints, and unique indexes enforced by the database engine. | No native foreign key enforcement. Application code must manually maintain referential integrity. | **CRITICAL**: Orphaned assignments, missing resolution proofs, or invalid category assignments could breach civic SLAs and cause municipal dispatches to fail. |
| **Audit Trail & Immutability** | Append-only status history tables with engine-level triggers preventing modification or deletion. | Requires append-only collections; soft deletes or modifications require application-level guarding. | **HIGH**: Civic accountability demands tamper-proof status transition logs for public scrutiny and municipal ombudsman reviews. |
| **Geospatial Processing** | **OpenGIS standard** with `POINT`, `POLYGON`, `ST_Distance_Sphere`, `ST_Contains`, and R-Tree spatial indexing. | GeoJSON spatial indexing (`2dsphere`), `$near`, and `$geoWithin`. | **TIE/STRONG**: Both support geospatial queries. MySQL 8.0 spatial indexing matches MongoDB performance for point-in-polygon and distance calculations. |
| **Schema Evolution vs. Strict Governance** | Strong schema enforcement via DDL migrations (Flyway/Liquibase). Prevents malformed submissions. | Flexible schema. Easy to modify, but allows dirty or inconsistent fields across millions of citizen reports. | **HIGH**: Municipal records require standardized schemas across government departments and reporting tools. |
| **Complex Aggregations & Reporting** | Advanced SQL with Window functions, CTEs, multi-table `JOIN`s for department SLAs and ward analytics. | Aggregation pipeline (`$lookup`, `$facet`). Powerful, but multi-collection joins are computationally expensive. | **HIGH**: CivicFix requires multi-dimensional reporting across wards, categories, worker performance, and SLA resolution times. |
| **Tooling & Enterprise Java Ecosystem** | Industry-standard support via Spring Data JPA, Hibernate, JDBC Connection Pooling (HikariCP). | Spring Data MongoDB. Mature, but lacks Hibernate-level object-relational mapping maturity. | **HIGH**: Enterprise Java backends excel at relational mapping with type-safe repositories. |

### Architectural Conclusion: Why MySQL is Chosen

**MySQL 8.0+ (InnoDB)** is decisively chosen as the primary database engine for CivicFix for the following reasons:

1. **Transactional Accountability (ACID)**: When a municipal technician marks a water pipe or dangerous pothole as `RESOLVED`, three operations must succeed atomically:
   - Update `issues.status` to `RESOLVED`
   - Insert an immutable record into `issue_status_history`
   - Insert an authorized `resolution_proof` record with before/after photo verification
   - Notify the reporting citizen and municipal supervisor
   In MySQL, this is guaranteed in a single database transaction with zero risk of partial failures.
2. **Referential Integrity**: An issue cannot exist without a valid citizen `user_id`, valid `category_id`, and geocoded `location_id`. MySQL enforces this at the engine level through foreign key constraints, eliminating data drift or orphan records.
3. **Advanced GIS Capabilities in MySQL 8.0**: MySQL provides native SRID 4326 (WGS 84) coordinate systems, spatial R-Tree indexing, and distance calculations (`ST_Distance_Sphere`) that allow the system to rapidly query issues within a citizen's neighborhood or a municipal maintenance crew's ward.
4. **Audit Immutability**: Historical records and comments are legally binding public administration data. Relational schema constraints with restricted `UPDATE`/`DELETE` grants ensure full municipal transparency.

---

## 2. Entity-Relationship (ER) Diagram (Mermaid)

```mermaid
erDiagram
    USERS ||--o{ ISSUES : "reports"
    USERS ||--o{ COMMENTS : "writes"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ ASSIGNMENTS : "assigned_to / assigned_by"
    USERS ||--o{ ISSUE_STATUS_HISTORY : "changed_by"
    USERS ||--o{ RESOLUTION_PROOF : "verified_by"

    ISSUE_CATEGORIES ||--o{ ISSUES : "classifies"

    LOCATIONS ||--o{ ISSUES : "pinpoints"

    ISSUES ||--|{ ISSUE_PHOTOS : "contains"
    ISSUES ||--o{ ISSUE_STATUS_HISTORY : "tracks_audit"
    ISSUES ||--o{ ASSIGNMENTS : "dispatched_via"
    ISSUES ||--o{ COMMENTS : "contains_discussion"
    ISSUES ||--o{ NOTIFICATIONS : "triggers"
    ISSUES ||--o| RESOLUTION_PROOF : "culminates_in"

    USERS {
        BIGINT id PK
        VARCHAR email UK
        VARCHAR password_hash
        VARCHAR full_name
        VARCHAR phone_number UK
        ENUM role
        ENUM status
        VARCHAR department
        VARCHAR employee_badge_no
        DATETIME created_at
        DATETIME updated_at
    }

    ISSUE_CATEGORIES {
        BIGINT id PK
        VARCHAR code UK
        VARCHAR name
        TEXT description
        ENUM default_priority
        INT default_sla_hours
        VARCHAR icon_name
        BOOLEAN is_active
        DATETIME created_at
    }

    LOCATIONS {
        BIGINT id PK
        DECIMAL latitude
        DECIMAL longitude
        POINT geo_point
        VARCHAR formatted_address
        VARCHAR street_number
        VARCHAR route
        VARCHAR neighborhood
        VARCHAR ward
        VARCHAR city
        VARCHAR state
        VARCHAR postal_code
        VARCHAR landmark
        DATETIME created_at
    }

    ISSUES {
        BIGINT id PK
        VARCHAR issue_code UK
        BIGINT reporter_id FK
        BIGINT category_id FK
        BIGINT location_id FK
        VARCHAR title
        TEXT description
        ENUM status
        ENUM priority
        ENUM visibility
        INT upvote_count
        INT comment_count
        DATETIME sla_deadline
        DATETIME resolved_at
        DATETIME closed_at
        DATETIME created_at
        DATETIME updated_at
    }

    ISSUE_PHOTOS {
        BIGINT id PK
        BIGINT issue_id FK
        VARCHAR photo_url
        VARCHAR thumbnail_url
        VARCHAR caption
        DECIMAL gps_lat
        DECIMAL gps_lng
        INT display_order
        BIGINT file_size_bytes
        VARCHAR mime_type
        VARCHAR sha256_hash
        DATETIME captured_at
        DATETIME uploaded_at
    }

    ISSUE_STATUS_HISTORY {
        BIGINT id PK
        BIGINT issue_id FK
        ENUM previous_status
        ENUM new_status
        BIGINT changed_by_user_id FK
        TEXT reason_or_notes
        VARCHAR change_trigger
        DATETIME created_at
    }

    ASSIGNMENTS {
        BIGINT id PK
        BIGINT issue_id FK
        BIGINT assigned_to_user_id FK
        BIGINT assigned_by_user_id FK
        VARCHAR department_name
        ENUM assignment_status
        TEXT instructions
        DATETIME scheduled_for
        DATETIME deadline
        DATETIME completed_at
        DATETIME created_at
        DATETIME updated_at
    }

    NOTIFICATIONS {
        BIGINT id PK
        BIGINT user_id FK
        BIGINT issue_id FK
        VARCHAR title
        TEXT message
        ENUM notification_type
        ENUM delivery_channel
        BOOLEAN is_read
        DATETIME read_at
        DATETIME created_at
    }

    COMMENTS {
        BIGINT id PK
        BIGINT issue_id FK
        BIGINT user_id FK
        TEXT content
        BOOLEAN is_internal_note
        BOOLEAN is_flagged
        DATETIME created_at
        DATETIME updated_at
    }

    RESOLUTION_PROOF {
        BIGINT id PK
        BIGINT issue_id FK UK
        BIGINT worker_id FK
        BIGINT verified_by_user_id FK
        TEXT work_description
        VARCHAR before_photo_url
        VARCHAR after_photo_url
        DECIMAL labor_hours
        DECIMAL materials_cost
        ENUM verification_status
        TEXT citizen_feedback
        INT citizen_rating
        DATETIME verified_at
        DATETIME created_at
        DATETIME updated_at
    }
```

---

## 3. Complete Entity Specifications

### 3.1 Users
Stores citizens, municipal field workers, departmental dispatchers, supervisors, and platform administrators.

- **Primary Key:** `id` (BIGINT UNSIGNED, AUTO_INCREMENT)
- **Engine:** InnoDB, utf8mb4_unicode_ci

| Field Name | Data Type | Nullable | Default | Constraints & Validation | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INC | `PRIMARY KEY` | Unique surrogate key |
| `email` | `VARCHAR(255)` | NO | None | `UNIQUE`, Email regex check | Citizen or municipal staff login email |
| `password_hash` | `VARCHAR(255)` | NO | None | Min 60 chars (BCrypt / Argon2id) | Secure cryptographic salt & hash |
| `full_name` | `VARCHAR(120)` | NO | None | Length >= 2 | Display name |
| `phone_number` | `VARCHAR(30)` | YES | NULL | `UNIQUE`, E.164 format (+1...) | SMS alert and emergency contact |
| `role` | `ENUM(...)` | NO | `'CITIZEN'` | Values: `CITIZEN`, `FIELD_WORKER`, `DISPATCHER`, `SUPERVISOR`, `ADMIN` | Role-based authorization |
| `status` | `ENUM(...)` | NO | `'ACTIVE'` | Values: `ACTIVE`, `SUSPENDED`, `PENDING_VERIFICATION` | Account lifecycle state |
| `department` | `VARCHAR(100)` | YES | NULL | NULL for CITIZEN | e.g., 'Public Works', 'Sanitation' |
| `employee_badge_no` | `VARCHAR(50)` | YES | NULL | `UNIQUE` where not null | Staff identification code |
| `avatar_url` | `VARCHAR(512)` | YES | NULL | Valid URL format | Profile picture |
| `created_at` | `DATETIME(6)` | NO | `CURRENT_TIMESTAMP(6)` | Non-modifiable | Account registration timestamp |
| `updated_at` | `DATETIME(6)` | NO | `CURRENT_TIMESTAMP(6) ON UPDATE` | Track modifications | Profile update timestamp |

- **Indexes:**
  - `PRIMARY KEY (id)`
  - `UNIQUE KEY uq_users_email (email)`
  - `UNIQUE KEY uq_users_phone (phone_number)`
  - `INDEX idx_users_role_status (role, status)`
  - `INDEX idx_users_department (department)`

---

### 3.2 Issue Categories
Municipal taxonomy for routing reports to appropriate departments and defining SLAs.

- **Primary Key:** `id` (BIGINT UNSIGNED, AUTO_INCREMENT)

| Field Name | Data Type | Nullable | Default | Constraints & Validation | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INC | `PRIMARY KEY` | Category identifier |
| `code` | `VARCHAR(50)` | NO | None | `UNIQUE`, Uppercase alphanumeric | Machine code (e.g. `ROAD_POTHOLE`, `WATER_LEAK`) |
| `name` | `VARCHAR(100)` | NO | None | Not blank | User-facing title (e.g., 'Potholes & Pavement') |
| `description` | `TEXT` | YES | NULL | Max 1000 chars | Citizen guidance on what qualifies |
| `target_department`| `VARCHAR(100)`| NO | None | Must match municipal departments | Assigned department (e.g. 'Transportation Dept') |
| `default_priority` | `ENUM(...)` | NO | `'MEDIUM'` | Values: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` | Initial severity rating |
| `default_sla_hours`| `INT UNSIGNED` | NO | `72` | `CHECK (default_sla_hours > 0)` | Maximum allowed turnaround in hours |
| `icon_name` | `VARCHAR(60)` | NO | `'AlertCircle'` | Lucide icon identifier | Frontend UI visual representation |
| `color_hex` | `VARCHAR(7)` | NO | `'#3B82F6'` | Regex `^#[0-9A-Fa-f]{6}$` | UI badge accent color |
| `is_active` | `BOOLEAN` | NO | `TRUE` | Boolean flag | Allows deprecating obsolete categories |
| `created_at` | `DATETIME(6)` | NO | `CURRENT_TIMESTAMP(6)` | Non-modifiable | Timestamp |

- **Indexes:**
  - `PRIMARY KEY (id)`
  - `UNIQUE KEY uq_categories_code (code)`
  - `INDEX idx_categories_active_prio (is_active, default_priority)`

---

### 3.3 Locations
Normalized geospatial and postal location records to support spatial radius indexing and ward analytics.

- **Primary Key:** `id` (BIGINT UNSIGNED, AUTO_INCREMENT)

| Field Name | Data Type | Nullable | Default | Constraints & Validation | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INC | `PRIMARY KEY` | Location surrogate identifier |
| `latitude` | `DECIMAL(10, 8)` | NO | None | `CHECK (latitude BETWEEN -90.0 AND 90.0)` | WGS84 latitude coordinate |
| `longitude` | `DECIMAL(11, 8)` | NO | None | `CHECK (longitude BETWEEN -180.0 AND 180.0)`| WGS84 longitude coordinate |
| `geo_point` | `POINT` (SRID 4326) | NO | None | Calculated or generated point | Native spatial point for R-Tree index |
| `formatted_address`| `VARCHAR(255)`| NO | None | Full geocoded address | Human-readable address string |
| `street_number` | `VARCHAR(30)` | YES | NULL | Address building number | Optional parcel number |
| `route` | `VARCHAR(120)` | YES | NULL | Street or avenue name | e.g., 'Maple Boulevard' |
| `neighborhood` | `VARCHAR(100)` | YES | NULL | Locality / Sub-ward | e.g., 'West End', 'Downtown' |
| `ward` | `VARCHAR(60)` | NO | None | Ward code or municipal district | e.g., 'Ward 4', 'District B' |
| `city` | `VARCHAR(100)` | NO | `'Metropolis'` | City jurisdiction | Municipal administrative entity |
| `state` | `VARCHAR(50)` | NO | None | State / Province | Administrative state |
| `postal_code` | `VARCHAR(20)` | NO | None | ZIP / Postal code | Mail routing index |
| `landmark` | `VARCHAR(150)` | YES | NULL | Optional physical reference | e.g., 'Opposite Central High School' |
| `created_at` | `DATETIME(6)` | NO | `CURRENT_TIMESTAMP(6)` | Non-modifiable | Geocode creation timestamp |

- **Indexes:**
  - `PRIMARY KEY (id)`
  - `SPATIAL INDEX sp_idx_locations_geopoint (geo_point)`
  - `INDEX idx_locations_ward_city (ward, city)`
  - `INDEX idx_locations_lat_lng (latitude, longitude)`

---

### 3.4 Issues
The foundational core entity tracking reported civic grievances, their status lifecycle, and deadlines.

- **Primary Key:** `id` (BIGINT UNSIGNED, AUTO_INCREMENT)
- **Foreign Keys:**
  - `reporter_id` -> `users(id)` `ON DELETE RESTRICT` (maintains reporting citizen record)
  - `category_id` -> `issue_categories(id)` `ON DELETE RESTRICT`
  - `location_id` -> `locations(id)` `ON DELETE RESTRICT`

| Field Name | Data Type | Nullable | Default | Constraints & Validation | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INC | `PRIMARY KEY` | Internal surrogate key |
| `issue_code` | `VARCHAR(32)` | NO | None | `UNIQUE`, e.g. `CVX-2026-08491` | Human-readable citizen tracking token |
| `reporter_id` | `BIGINT UNSIGNED` | NO | None | `FOREIGN KEY` -> `users(id)` | Citizen reporting the issue |
| `category_id` | `BIGINT UNSIGNED` | NO | None | `FOREIGN KEY` -> `issue_categories(id)` | Problem category |
| `location_id` | `BIGINT UNSIGNED` | NO | None | `FOREIGN KEY` -> `locations(id)` | Physical geospatial coordinate |
| `title` | `VARCHAR(150)` | NO | None | Length between 5 and 150 | Concise headline |
| `description` | `TEXT` | NO | None | Length between 10 and 5000 | Detailed narrative from citizen |
| `status` | `ENUM(...)` | NO | `'REPORTED'` | Values: `REPORTED`, `UNDER_REVIEW`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `VERIFIED`, `REJECTED`, `REOPENED` | Current progress status |
| `priority` | `ENUM(...)` | NO | `'MEDIUM'` | Values: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` | Triage urgency |
| `visibility` | `ENUM(...)` | NO | `'PUBLIC'` | Values: `PUBLIC`, `CONFIDENTIAL` | Public community view or private |
| `upvote_count` | `INT UNSIGNED` | NO | `1` | `CHECK (upvote_count >= 0)` | Cached citizen endorsements |
| `comment_count` | `INT UNSIGNED` | NO | `0` | `CHECK (comment_count >= 0)` | Cached discussion count |
| `sla_deadline` | `DATETIME(6)` | NO | None | Computed from category SLA | Required completion time |
| `resolved_at` | `DATETIME(6)` | YES | NULL | Set when status -> `RESOLVED` | Work completion timestamp |
| `closed_at` | `DATETIME(6)` | YES | NULL | Set when status -> `VERIFIED` | Final sign-off timestamp |
| `created_at` | `DATETIME(6)` | NO | `CURRENT_TIMESTAMP(6)` | Non-modifiable | Date reported |
| `updated_at` | `DATETIME(6)` | NO | `CURRENT_TIMESTAMP(6) ON UPDATE` | Track mutations | Last modified date |

- **Indexes:**
  - `PRIMARY KEY (id)`
  - `UNIQUE KEY uq_issues_code (issue_code)`
  - `INDEX idx_issues_status_prio (status, priority)`
  - `INDEX idx_issues_category_status (category_id, status)`
  - `INDEX idx_issues_reporter (reporter_id)`
  - `INDEX idx_issues_location (location_id)`
  - `INDEX idx_issues_created_at (created_at DESC)`
  - `FULLTEXT INDEX ft_issues_search (title, description)`

---

### 3.5 Issue Photos
Visual evidence uploaded by citizens when reporting an issue. Supports multiple photographic angles and EXIF GPS metadata verification.

- **Primary Key:** `id` (BIGINT UNSIGNED, AUTO_INCREMENT)
- **Foreign Keys:**
  - `issue_id` -> `issues(id)` `ON DELETE CASCADE` (if issue is scrubbed during dev/testing)

| Field Name | Data Type | Nullable | Default | Constraints & Validation | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INC | `PRIMARY KEY` | Photo surrogate key |
| `issue_id` | `BIGINT UNSIGNED` | NO | None | `FOREIGN KEY` -> `issues(id)` | Parent issue |
| `photo_url` | `VARCHAR(512)` | NO | None | S3 / GCS URL or secure CDN path | Full-resolution image URL |
| `thumbnail_url` | `VARCHAR(512)` | NO | None | Valid image URL | Optimized mobile thumbnail URL |
| `caption` | `VARCHAR(200)` | YES | NULL | Optional text | Citizen note on photo |
| `gps_lat` | `DECIMAL(10, 8)` | YES | NULL | EXIF extracted latitude | Verification against report coords |
| `gps_lng` | `DECIMAL(11, 8)` | YES | NULL | EXIF extracted longitude | Verification against report coords |
| `display_order` | `TINYINT UNSIGNED`| NO | `1` | `CHECK (display_order BETWEEN 1 AND 10)`| Carousel sorting position |
| `file_size_bytes`| `BIGINT UNSIGNED`| NO | None | Max 15MB (15728640 bytes) | File byte count |
| `mime_type` | `VARCHAR(50)` | NO | `'image/jpeg'` | `image/jpeg`, `image/png`, `image/webp`| Media type |
| `sha256_hash` | `CHAR(64)` | NO | None | Hexadecimal digest | Deduplication & integrity check |
| `captured_at` | `DATETIME(6)` | YES | NULL | EXIF timestamp | Device camera capture time |
| `uploaded_at` | `DATETIME(6)` | NO | `CURRENT_TIMESTAMP(6)` | System upload time | Ingestion timestamp |

- **Indexes:**
  - `PRIMARY KEY (id)`
  - `INDEX idx_photos_issue_order (issue_id, display_order)`
  - `INDEX idx_photos_hash (sha256_hash)`

---

### 3.6 Issue Status History
An immutable audit log recording every transition in an issue's lifecycle. Critical for ombudsman scrutiny, department accountability, and citizen trust.

- **Primary Key:** `id` (BIGINT UNSIGNED, AUTO_INCREMENT)
- **Foreign Keys:**
  - `issue_id` -> `issues(id)` `ON DELETE CASCADE`
  - `changed_by_user_id` -> `users(id)` `ON DELETE RESTRICT`

| Field Name | Data Type | Nullable | Default | Constraints & Validation | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INC | `PRIMARY KEY` | Audit record identifier |
| `issue_id` | `BIGINT UNSIGNED` | NO | None | `FOREIGN KEY` -> `issues(id)` | Target issue |
| `previous_status`| `VARCHAR(30)` | YES | NULL | Nullable on initial submission | State before change |
| `new_status` | `VARCHAR(30)` | NO | None | Valid IssueStatus enum value | State after change |
| `changed_by_user_id`| `BIGINT UNSIGNED`| NO | None | `FOREIGN KEY` -> `users(id)` | Staff member or citizen |
| `reason_or_notes`| `TEXT` | YES | NULL | Max 2000 chars | Justification for state transition |
| `change_trigger` | `VARCHAR(50)` | NO | `'MANUAL_DISPATCH'`| e.g., `'CITIZEN_SUBMISSION'`, `'WORKER_COMPLETION'`, `'SYSTEM_SLA_BREACH'` | System event or manual action |
| `created_at` | `DATETIME(6)` | NO | `CURRENT_TIMESTAMP(6)` | Non-modifiable | Timestamp of transition |

- **Indexes:**
  - `PRIMARY KEY (id)`
  - `INDEX idx_status_history_issue (issue_id, created_at ASC)`
  - `INDEX idx_status_history_user (changed_by_user_id)`

---

### 3.7 Assignments
Tracks work orders assigned to municipal maintenance crews or field workers, with dispatch status and completion deadlines.

- **Primary Key:** `id` (BIGINT UNSIGNED, AUTO_INCREMENT)
- **Foreign Keys:**
  - `issue_id` -> `issues(id)` `ON DELETE RESTRICT`
  - `assigned_to_user_id` -> `users(id)` `ON DELETE RESTRICT`
  - `assigned_by_user_id` -> `users(id)` `ON DELETE RESTRICT`

| Field Name | Data Type | Nullable | Default | Constraints & Validation | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INC | `PRIMARY KEY` | Assignment unique identifier |
| `issue_id` | `BIGINT UNSIGNED` | NO | None | `FOREIGN KEY` -> `issues(id)` | Dispatched issue |
| `assigned_to_user_id`| `BIGINT UNSIGNED`| NO | None | `FOREIGN KEY` -> `users(id)` | Field worker or crew lead |
| `assigned_by_user_id`| `BIGINT UNSIGNED`| NO | None | `FOREIGN KEY` -> `users(id)` | Dispatcher or supervisor |
| `department_name`| `VARCHAR(100)` | NO | None | Must match worker's department | Responsible municipal department |
| `assignment_status` | `ENUM(...)` | NO | `'ASSIGNED'` | Values: `ASSIGNED`, `ACCEPTED`, `EN_ROUTE`, `ON_SITE`, `COMPLETED`, `REASSIGNED`, `CANCELLED` | Dispatch progress |
| `instructions` | `TEXT` | YES | NULL | Max 3000 chars | Dispatcher instructions to crew |
| `scheduled_for` | `DATETIME(6)` | YES | NULL | Target appointment or start | Planned commencement |
| `deadline` | `DATETIME(6)` | NO | None | SLA target | Must finish before this date |
| `completed_at` | `DATETIME(6)` | YES | NULL | Work completion timestamp | Actual completion time |
| `created_at` | `DATETIME(6)` | NO | `CURRENT_TIMESTAMP(6)` | Non-modifiable | Dispatch creation date |
| `updated_at` | `DATETIME(6)` | NO | `CURRENT_TIMESTAMP(6) ON UPDATE` | Track mutations | Last modified date |

- **Indexes:**
  - `PRIMARY KEY (id)`
  - `INDEX idx_assignments_worker_status (assigned_to_user_id, assignment_status)`
  - `INDEX idx_assignments_issue (issue_id)`
  - `INDEX idx_assignments_deadline (deadline ASC)`

---

### 3.8 Notifications
Dispatches alerts to citizens regarding issue status progress and alerts to workers regarding urgent work orders.

- **Primary Key:** `id` (BIGINT UNSIGNED, AUTO_INCREMENT)
- **Foreign Keys:**
  - `user_id` -> `users(id)` `ON DELETE CASCADE`
  - `issue_id` -> `issues(id)` `ON DELETE SET NULL`

| Field Name | Data Type | Nullable | Default | Constraints & Validation | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INC | `PRIMARY KEY` | Notification identifier |
| `user_id` | `BIGINT UNSIGNED` | NO | None | `FOREIGN KEY` -> `users(id)` | Recipient |
| `issue_id` | `BIGINT UNSIGNED` | YES | NULL | `FOREIGN KEY` -> `issues(id)` | Related issue |
| `title` | `VARCHAR(150)` | NO | None | Notification title | Alert heading |
| `message` | `TEXT` | NO | None | Notification body | Detailed message |
| `notification_type`| `ENUM(...)` | NO | `'STATUS_UPDATE'`| Values: `STATUS_UPDATE`, `WORKER_ASSIGNED`, `COMMENT_ADDED`, `RESOLUTION_VERIFIED`, `SLA_BREACH_ALERT` | Category of alert |
| `delivery_channel` | `ENUM(...)` | NO | `'IN_APP'` | Values: `IN_APP`, `SMS`, `EMAIL`, `PUSH` | Target transmission medium |
| `is_read` | `BOOLEAN` | NO | `FALSE` | Boolean flag | Read status |
| `read_at` | `DATETIME(6)` | YES | NULL | Populated when opened | User acknowledgment time |
| `created_at` | `DATETIME(6)` | NO | `CURRENT_TIMESTAMP(6)` | Non-modifiable | Alert generation time |

- **Indexes:**
  - `PRIMARY KEY (id)`
  - `INDEX idx_notifs_user_read (user_id, is_read, created_at DESC)`

---

### 3.9 Comments
Facilitates collaborative dialogue between citizens and municipal staff, with internal note support for department privacy.

- **Primary Key:** `id` (BIGINT UNSIGNED, AUTO_INCREMENT)
- **Foreign Keys:**
  - `issue_id` -> `issues(id)` `ON DELETE CASCADE`
  - `user_id` -> `users(id)` `ON DELETE RESTRICT`

| Field Name | Data Type | Nullable | Default | Constraints & Validation | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INC | `PRIMARY KEY` | Comment identifier |
| `issue_id` | `BIGINT UNSIGNED` | NO | None | `FOREIGN KEY` -> `issues(id)` | Target issue |
| `user_id` | `BIGINT UNSIGNED` | NO | None | `FOREIGN KEY` -> `users(id)` | Author |
| `content` | `TEXT` | NO | None | Length between 1 and 2000 | Comment message body |
| `is_internal_note`| `BOOLEAN` | NO | `FALSE` | Only visible to staff if TRUE | Staff-only internal dispatch log |
| `is_flagged` | `BOOLEAN` | NO | `FALSE` | Content moderation flag | Citizen content moderation |
| `created_at` | `DATETIME(6)` | NO | `CURRENT_TIMESTAMP(6)` | Non-modifiable | Submission timestamp |
| `updated_at` | `DATETIME(6)` | NO | `CURRENT_TIMESTAMP(6) ON UPDATE` | Track edits | Modification timestamp |

- **Indexes:**
  - `PRIMARY KEY (id)`
  - `INDEX idx_comments_issue_internal (issue_id, is_internal_note, created_at ASC)`
  - `INDEX idx_comments_user (user_id)`

---

### 3.10 Resolution Proof
The verifiable evidentiary record demonstrating that a civic issue has been resolved by municipal workers, complete with post-repair photos, labor costs, and citizen sign-off.

- **Primary Key:** `id` (BIGINT UNSIGNED, AUTO_INCREMENT)
- **Foreign Keys:**
  - `issue_id` -> `issues(id)` `ON DELETE RESTRICT` (`UNIQUE` constraint guarantees 1:1 or 1:0..1)
  - `worker_id` -> `users(id)` `ON DELETE RESTRICT`
  - `verified_by_user_id` -> `users(id)` `ON DELETE SET NULL`

| Field Name | Data Type | Nullable | Default | Constraints & Validation | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INC | `PRIMARY KEY` | Proof surrogate identifier |
| `issue_id` | `BIGINT UNSIGNED` | NO | None | `UNIQUE`, `FOREIGN KEY` -> `issues(id)` | 1-to-1 link with resolved issue |
| `worker_id` | `BIGINT UNSIGNED` | NO | None | `FOREIGN KEY` -> `users(id)` | Worker who completed repair |
| `verified_by_user_id`| `BIGINT UNSIGNED`| YES | NULL | `FOREIGN KEY` -> `users(id)` | Supervisor or citizen who signed off |
| `work_description` | `TEXT` | NO | None | Min 20 chars | Narrative of repair work conducted |
| `before_photo_url` | `VARCHAR(512)` | NO | None | Valid photo URL | Reference photo before repair |
| `after_photo_url` | `VARCHAR(512)` | NO | None | Valid photo URL | Photo verifying completed fix |
| `labor_hours` | `DECIMAL(5, 2)` | YES | NULL | `CHECK (labor_hours >= 0)` | Field crew man-hours expended |
| `materials_cost` | `DECIMAL(10, 2)`| YES | NULL | `CHECK (materials_cost >= 0)` | Public expenditure incurred ($) |
| `verification_status`| `ENUM(...)`| NO | `'PENDING_REVIEW'`| Values: `PENDING_REVIEW`, `APPROVED`, `REJECTED`, `CITIZEN_DISPUTED` | Sign-off status |
| `citizen_feedback` | `TEXT` | YES | NULL | Max 1000 chars | Post-resolution citizen review |
| `citizen_rating` | `TINYINT UNSIGNED`| YES | NULL | `CHECK (citizen_rating BETWEEN 1 AND 5)` | 1 to 5 star satisfaction score |
| `verified_at` | `DATETIME(6)` | YES | NULL | Timestamp of supervisor sign-off | Approval timestamp |
| `created_at` | `DATETIME(6)` | NO | `CURRENT_TIMESTAMP(6)` | Non-modifiable | Completion submission date |
| `updated_at` | `DATETIME(6)` | NO | `CURRENT_TIMESTAMP(6) ON UPDATE` | Track updates | Last updated timestamp |

- **Indexes:**
  - `PRIMARY KEY (id)`
  - `UNIQUE KEY uq_res_proof_issue (issue_id)`
  - `INDEX idx_res_proof_worker (worker_id)`
  - `INDEX idx_res_proof_status (verification_status)`

---

## 4. Relational Cardinality & Integrity Rules

| Parent Entity | Child Entity | Cardinality | Foreign Key & Constraint | Cascade Rule (ON DELETE / ON UPDATE) | Business Rule & Justification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `users` | `issues` | 1 : N | `issues.reporter_id` | `ON DELETE RESTRICT` / `ON UPDATE CASCADE` | Citizen accounts cannot be deleted if active reports exist; required for audit trails. |
| `issue_categories`| `issues` | 1 : N | `issues.category_id` | `ON DELETE RESTRICT` / `ON UPDATE CASCADE` | Categories cannot be deleted if assigned to any issues; use `is_active=FALSE` instead. |
| `locations` | `issues` | 1 : N | `issues.location_id` | `ON DELETE RESTRICT` / `ON UPDATE CASCADE` | A physical location is immutable and may be linked to multiple recurring civic incidents. |
| `issues` | `issue_photos` | 1 : N | `issue_photos.issue_id` | `ON DELETE CASCADE` / `ON UPDATE CASCADE` | Initial evidence photos belong to the issue lifecycle. |
| `issues` | `issue_status_history`| 1 : N | `issue_status_history.issue_id` | `ON DELETE RESTRICT` / `ON UPDATE CASCADE` | Audit log records must never be lost. |
| `users` | `issue_status_history`| 1 : N | `issue_status_history.changed_by_user_id` | `ON DELETE RESTRICT` / `ON UPDATE CASCADE` | The user who authorized a status change must remain in historical logs. |
| `issues` | `assignments` | 1 : N | `assignments.issue_id` | `ON DELETE RESTRICT` / `ON UPDATE CASCADE` | An issue can have multiple assignment records (e.g. reassignment to different crews). |
| `users` (Worker) | `assignments` | 1 : N | `assignments.assigned_to_user_id` | `ON DELETE RESTRICT` / `ON UPDATE CASCADE` | Prevents deleting staff with open field assignments. |
| `users` (Dispatcher) | `assignments` | 1 : N | `assignments.assigned_by_user_id` | `ON DELETE RESTRICT` / `ON UPDATE CASCADE` | Preserves who dispatched the crew. |
| `issues` | `comments` | 1 : N | `comments.issue_id` | `ON DELETE CASCADE` / `ON UPDATE CASCADE` | Public and internal discussions belong to the issue thread. |
| `users` | `comments` | 1 : N | `comments.user_id` | `ON DELETE RESTRICT` / `ON UPDATE CASCADE` | Comment author identity is preserved. |
| `users` | `notifications`| 1 : N | `notifications.user_id` | `ON DELETE CASCADE` / `ON UPDATE CASCADE` | User inbox notifications can cascade if a test account is purged. |
| `issues` | `resolution_proof` | 1 : 1 (or 0..1) | `resolution_proof.issue_id` (`UNIQUE`) | `ON DELETE RESTRICT` / `ON UPDATE CASCADE` | Exactly one verified resolution proof dossier per completed issue. |
| `users` (Supervisor)| `resolution_proof` | 1 : N | `resolution_proof.verified_by_user_id` | `ON DELETE SET NULL` / `ON UPDATE CASCADE` | Sign-off officer record. |

---

## 5. Database Normalization Analysis

### First Normal Form (1NF)
- **Criterion**: All table attributes contain atomic, scalar values; no multi-valued columns or repeating groups.
- **Application**:
  - Addresses are deconstructed into scalar components (`street_number`, `route`, `neighborhood`, `ward`, `city`, `state`, `postal_code`) rather than a single ambiguous string.
  - Photos are separated into a dedicated `issue_photos` table rather than storing comma-separated URL lists or arrays inside the `issues` table.
  - Coordinates are stored as precision `DECIMAL(10,8)` and `DECIMAL(11,8)` and standardized `POINT` types.

### Second Normal Form (2NF)
- **Criterion**: Table must be in 1NF, and all non-key attributes must be fully functionally dependent on the entire primary key (no partial key dependencies).
- **Application**:
  - Every table utilizes a single-column surrogate primary key (`id BIGINT UNSIGNED AUTO_INCREMENT`).
  - Consequently, no partial key dependencies can exist since no compound primary keys are used for business data.

### Third Normal Form (3NF)
- **Criterion**: Table must be in 2NF, and no non-key attribute is transitively dependent on the primary key (X -> Y and Y -> Z is prohibited).
- **Application**:
  - `issues` does not store category SLA hours, category icons, or department names; it references `category_id`.
  - `issues` does not store citizen phone numbers or emails; it references `reporter_id`.
  - `issues` does not store postal codes or neighborhood names; it references `location_id`.
  - `assignments` references `assigned_to_user_id` rather than storing staff badge numbers or worker names.

### Boyce-Codd Normal Form (BCNF)
- **Criterion**: For every non-trivial functional dependency $X \to Y$, $X$ must be a superkey.
- **Application**:
  - All deterministic determinants in each entity are either the primary key or unique candidate keys (e.g., `email` in `users`, `issue_code` in `issues`, `code` in `issue_categories`).

### Pragmatic Denormalization & Performance Optimizations
While adhering to 3NF/BCNF, high-scale civic systems require controlled, intentional denormalization to eliminate high-frequency count queries:
1. **`issues.upvote_count`**: Maintained via application transactions or increment triggers. Prevents executing `SELECT COUNT(*) FROM issue_upvotes WHERE issue_id = ?` on every list view.
2. **`issues.comment_count`**: Cached count on the issue row to avoid multi-table joins when rendering feeds.
3. **`locations.geo_point`**: Maintained alongside raw `latitude` and `longitude` to allow direct spatial R-Tree index evaluations without runtime coordinate transformations.

---

## 6. Comprehensive Indexing Strategy

### 6.1 Index Classification & Cardinality

| Table | Index Name | Index Type | Columns | Optimization Goal |
| :--- | :--- | :--- | :--- | :--- |
| `users` | `PRIMARY` | B-Tree Clustered | `(id)` | Surrogate key lookups |
| `users` | `uq_users_email` | B-Tree Unique | `(email)` | Citizen and staff authentication |
| `users` | `idx_users_role_status` | B-Tree Composite | `(role, status)` | Dispatcher filtering available field workers |
| `locations` | `sp_idx_locations_geopoint` | **Spatial R-Tree** | `(geo_point)` | Proximity searches: "Find all potholes within 2km" |
| `locations` | `idx_locations_ward_city`| B-Tree Composite | `(ward, city)` | Ward-level civic governance and aggregation |
| `issues` | `PRIMARY` | B-Tree Clustered | `(id)` | Main entity access |
| `issues` | `uq_issues_code` | B-Tree Unique | `(issue_code)` | Citizen tracking lookups (e.g. `CVX-2026-08491`) |
| `issues` | `idx_issues_status_prio` | B-Tree Composite | `(status, priority, created_at)` | Triage dashboard: sorting open high-priority issues |
| `issues` | `idx_issues_category_status`| B-Tree Composite| `(category_id, status)` | Departmental queue filtering |
| `issues` | `ft_issues_search` | **Full-Text** | `(title, description)` | Citizen natural-language keyword searching |
| `assignments` | `idx_assignments_worker` | B-Tree Composite | `(assigned_to_user_id, assignment_status)` | Field worker mobile app: "My Open Work Orders" |
| `assignments` | `idx_assignments_deadline` | B-Tree | `(deadline ASC)` | SLA monitors identifying impending breaches |
| `issue_status_history`| `idx_history_issue_time`| B-Tree Composite | `(issue_id, created_at ASC)` | Timeline rendering on citizen issue detail page |
| `resolution_proof`| `uq_res_proof_issue` | B-Tree Unique | `(issue_id)` | Enforces strict 1-to-1 resolution dossier |

### 6.2 Spatial Query Optimization Example
For searching issues within a 5-kilometer radius of a citizen's GPS coordinates:
```sql
SELECT i.id, i.issue_code, i.title, i.status, 
       ST_Distance_Sphere(l.geo_point, ST_SRID(POINT(-73.985130, 40.748817), 4326)) AS distance_meters
FROM issues i
JOIN locations l ON i.location_id = l.id
WHERE MBRContains(
    ST_MakeEnvelope(
        POINT(-73.985130 - 0.05, 40.748817 - 0.05),
        POINT(-73.985130 + 0.05, 40.748817 + 0.05)
    ),
    l.geo_point
)
AND ST_Distance_Sphere(l.geo_point, ST_SRID(POINT(-73.985130, 40.748817), 4326)) <= 5000
ORDER BY distance_meters ASC
LIMIT 50;
```

---

## 7. Security & Compliance Architecture

### 7.1 PII Protection & Credential Storage
- **Password Storage**: Passwords are never stored in plaintext. Passwords must be hashed using **Argon2id** (preferred) or **BCrypt with a work factor of 12+**.
- **Citizen Contact Information**: Phone numbers and email addresses are restricted to authorized dispatchers and the citizen themselves. Public feeds only display masked handles (e.g. `J. Doe` or `Citizen #4812`).
- **EXIF Sanitization**: When citizens upload photos via mobile devices, camera EXIF metadata (which may expose residential GPS coordinates or personal camera identifiers) is extracted for server validation, then permanently stripped before public CDN storage.

### 7.2 Role-Based Access Control (RBAC) Matrix

| Entity / Action | Citizen | Field Worker | Dispatcher | Supervisor | System Admin |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Create Issue** | `ALLOW` | `ALLOW` | `ALLOW` | `ALLOW` | `ALLOW` |
| **View Public Issues** | `ALLOW` | `ALLOW` | `ALLOW` | `ALLOW` | `ALLOW` |
| **View Internal Notes** | `DENY` | `ALLOW` | `ALLOW` | `ALLOW` | `ALLOW` |
| **Dispatch / Assign** | `DENY` | `DENY` | `ALLOW` | `ALLOW` | `ALLOW` |
| **Update Assignment Status**| `DENY` | `ALLOW (Own)` | `ALLOW` | `ALLOW` | `ALLOW` |
| **Submit Resolution Proof**| `DENY` | `ALLOW` | `ALLOW` | `ALLOW` | `ALLOW` |
| **Approve Resolution Proof**| `DENY` | `DENY` | `DENY` | `ALLOW` | `ALLOW` |
| **Manage Categories & Users**| `DENY` | `DENY` | `DENY` | `DENY` | `ALLOW` |

### 7.3 SQL Injection Prevention
All database interactions in the Java backend utilize **Spring Data JPA** and **Hibernate Criteria API / PreparedStatements**. Dynamic string concatenation in SQL queries is strictly prohibited by architectural policy and static analysis rules.

---

## 8. Sample Records (SQL & JSON Formats)

### 8.1 SQL DDL & Insert Statements

```sql
-- Create Database
CREATE DATABASE IF NOT EXISTS civicfix_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE civicfix_db;

-- 1. Users
INSERT INTO users (id, email, password_hash, full_name, phone_number, role, status, department, employee_badge_no)
VALUES 
(1, 'elena.rodriguez@example.com', '$2a$12$e8Y7iW5yZqH9z...hash', 'Elena Rodriguez', '+12025550143', 'CITIZEN', 'ACTIVE', NULL, NULL),
(2, 'marcus.vance@metropolis.gov', '$2a$12$k1L2m3N4o5P6q...hash', 'Marcus Vance', '+12025550189', 'FIELD_WORKER', 'ACTIVE', 'Public Works - Paving Crew', 'PW-7741'),
(3, 'sarah.connor@metropolis.gov', '$2a$12$z9Y8x7W6v5U4t...hash', 'Sarah Connor', '+12025550199', 'DISPATCHER', 'ACTIVE', 'Municipal Operations Center', 'MOC-102');

-- 2. Issue Categories
INSERT INTO issue_categories (id, code, name, description, target_department, default_priority, default_sla_hours, icon_name, color_hex, is_active)
VALUES 
(1, 'ROAD_POTHOLE', 'Potholes & Pavement Hazard', 'Severe road craters, asphalt crumbling, or sunken manholes endangering vehicles and cyclists.', 'Department of Transportation', 'HIGH', 48, 'Road', '#EF4444', 1),
(2, 'STREETLIGHT_OUT', 'Broken Streetlight', 'Darkened or flickering public street illumination compromising pedestrian safety.', 'Bureau of Street Lighting', 'MEDIUM', 72, 'Lightbulb', '#F59E0B', 1),
(3, 'WATER_LEAK', 'Water Main or Hydrant Leak', 'High volume municipal main rupture or leaking fire hydrant.', 'Water & Sewer Authority', 'CRITICAL', 24, 'Droplets', '#3B82F6', 1);

-- 3. Locations
INSERT INTO locations (id, latitude, longitude, geo_point, formatted_address, street_number, route, neighborhood, ward, city, state, postal_code, landmark)
VALUES 
(1, 40.74881700, -73.98513000, ST_SRID(POINT(-73.98513000, 40.74881700), 4326), '350 5th Ave, New York, NY 10118', '350', '5th Ave', 'Midtown', 'Ward 5', 'New York', 'NY', '10118', 'Intersection near Empire State Building West Entrance'),
(2, 40.75889600, -73.98513000, ST_SRID(POINT(-73.98513000, 40.75889600), 4326), '1540 Broadway, New York, NY 10036', '1540', 'Broadway', 'Theater District', 'Ward 5', 'New York', 'NY', '10036', 'Near 45th Street Pedestrian Plaza');

-- 4. Issues
INSERT INTO issues (id, issue_code, reporter_id, category_id, location_id, title, description, status, priority, visibility, upvote_count, comment_count, sla_deadline, created_at)
VALUES 
(1, 'CVX-2026-08491', 1, 1, 1, 'Deep 2-foot pothole in left bike lane', 'Crater has exposed rebar and is causing cyclists to swerve into fast traffic. Extremely dangerous during evening rush hour.', 'IN_PROGRESS', 'HIGH', 'PUBLIC', 14, 3, DATE_ADD(NOW(), INTERVAL 48 HOUR), NOW()),
(2, 'CVX-2026-08492', 1, 3, 2, 'Gushing water main flooding sidewalk', 'Clean municipal water bubbling up between granite curbs and flooding pedestrian crossing.', 'REPORTED', 'CRITICAL', 'PUBLIC', 29, 1, DATE_ADD(NOW(), INTERVAL 24 HOUR), NOW());

-- 5. Issue Photos
INSERT INTO issue_photos (id, issue_id, photo_url, thumbnail_url, caption, display_order, file_size_bytes, mime_type, sha256_hash)
VALUES 
(1, 1, 'https://storage.civicfix.org/photos/2026/09/pothole_crater_full.jpg', 'https://storage.civicfix.org/photos/2026/09/pothole_crater_thumb.jpg', 'Close up of pothole showing broken concrete and bike tire marks', 1, 3245100, 'image/jpeg', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');

-- 6. Issue Status History
INSERT INTO issue_status_history (id, issue_id, previous_status, new_status, changed_by_user_id, reason_or_notes, change_trigger, created_at)
VALUES 
(1, 1, NULL, 'REPORTED', 1, 'Initial submission via CivicFix Citizen Portal', 'CITIZEN_SUBMISSION', NOW() - INTERVAL 4 HOUR),
(2, 1, 'REPORTED', 'UNDER_REVIEW', 3, 'Reviewed by Municipal Dispatcher; validated severity and geocode', 'MANUAL_TRIAGE', NOW() - INTERVAL 3 HOUR),
(3, 1, 'UNDER_REVIEW', 'ASSIGNED', 3, 'Dispatched to Asphalt Paving Crew 4', 'MANUAL_DISPATCH', NOW() - INTERVAL 2 HOUR),
(4, 1, 'ASSIGNED', 'IN_PROGRESS', 2, 'Crew 4 on site; barricades erected, pneumatic compaction underway', 'WORKER_CHECK_IN', NOW() - INTERVAL 1 HOUR);

-- 7. Assignments
INSERT INTO assignments (id, issue_id, assigned_to_user_id, assigned_by_user_id, department_name, assignment_status, instructions, deadline)
VALUES 
(1, 1, 2, 3, 'Public Works - Paving Crew', 'ON_SITE', 'Hot asphalt patch required. Ensure cold joint sealant is applied along bike lane boundary.', DATE_ADD(NOW(), INTERVAL 40 HOUR));

-- 8. Notifications
INSERT INTO notifications (id, user_id, issue_id, title, message, notification_type, delivery_channel, is_read)
VALUES 
(1, 1, 1, 'Crew Dispatched to Your Report', 'Public Works Crew 4 is currently on site repairing your reported pothole on 5th Ave.', 'STATUS_UPDATE', 'IN_APP', 0);

-- 9. Comments
INSERT INTO comments (id, issue_id, user_id, content, is_internal_note, is_flagged)
VALUES 
(1, 1, 1, 'Thank you for prioritizing this! Two delivery riders blew tires this morning.', 0, 0),
(2, 1, 2, 'Standard 3-inch cold patch will not hold here; applying mastic asphalt with sealant.', 1, 0);

-- 10. Resolution Proof
INSERT INTO resolution_proof (id, issue_id, worker_id, verified_by_user_id, work_description, before_photo_url, after_photo_url, labor_hours, materials_cost, verification_status)
VALUES 
(1, 1, 2, NULL, 'Excavated loose roadbed, applied tack coat, filled with 4 tons of high-performance binder and surface asphalt, steam-rolled flush with pavement grade.', 
 'https://storage.civicfix.org/photos/2026/09/pothole_crater_full.jpg', 
 'https://storage.civicfix.org/photos/2026/09/pothole_repaired_after.jpg', 
 3.50, 485.50, 'PENDING_REVIEW');
```

### 8.2 Canonical JSON Document Representation
For downstream REST APIs and JSON logging:

```json
{
  "issue": {
    "id": 1,
    "issueCode": "CVX-2026-08491",
    "title": "Deep 2-foot pothole in left bike lane",
    "description": "Crater has exposed rebar and is causing cyclists to swerve into fast traffic.",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "visibility": "PUBLIC",
    "upvoteCount": 14,
    "commentCount": 3,
    "slaDeadline": "2026-09-12T23:23:00Z",
    "createdAt": "2026-09-10T23:23:00Z",
    "reporter": {
      "id": 1,
      "fullName": "Elena Rodriguez",
      "email": "elena.rodriguez@example.com",
      "role": "CITIZEN"
    },
    "category": {
      "id": 1,
      "code": "ROAD_POTHOLE",
      "name": "Potholes & Pavement Hazard",
      "targetDepartment": "Department of Transportation",
      "defaultSlaHours": 48
    },
    "location": {
      "id": 1,
      "latitude": 40.748817,
      "longitude": -73.985130,
      "formattedAddress": "350 5th Ave, New York, NY 10118",
      "ward": "Ward 5",
      "neighborhood": "Midtown",
      "landmark": "Near Empire State Building West Entrance"
    },
    "photos": [
      {
        "id": 1,
        "photoUrl": "https://storage.civicfix.org/photos/2026/09/pothole_crater_full.jpg",
        "thumbnailUrl": "https://storage.civicfix.org/photos/2026/09/pothole_crater_thumb.jpg",
        "caption": "Close up of pothole showing broken concrete",
        "displayOrder": 1
      }
    ],
    "currentAssignment": {
      "id": 1,
      "workerName": "Marcus Vance",
      "workerBadge": "PW-7741",
      "department": "Public Works - Paving Crew",
      "assignmentStatus": "ON_SITE",
      "deadline": "2026-09-12T15:00:00Z"
    },
    "resolutionProof": {
      "id": 1,
      "workDescription": "Excavated loose roadbed and steam-rolled flush asphalt.",
      "beforePhotoUrl": "https://storage.civicfix.org/photos/2026/09/pothole_crater_full.jpg",
      "afterPhotoUrl": "https://storage.civicfix.org/photos/2026/09/pothole_repaired_after.jpg",
      "laborHours": 3.5,
      "materialsCost": 485.50,
      "verificationStatus": "PENDING_REVIEW"
    }
  }
}
```

---

## 9. Java Spring Boot & DDL Schema Integration

To support the Java backend architecture requested by the framework, the following Spring Boot 3.x JPA entity mapping illustrates how these relational constraints are implemented in enterprise Java:

### 9.1 Java JPA Entity: `Issue.java`

```java
package com.civicfix.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "issues", indexes = {
    @Index(name = "idx_issues_status_prio", columnList = "status, priority"),
    @Index(name = "idx_issues_code", columnList = "issue_code", unique = true),
    @Index(name = "idx_issues_created_at", columnList = "created_at DESC")
})
@Getter
@Setter
public class Issue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "issue_code", nullable = false, unique = true, length = 32)
    private String issueCode;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reporter_id", nullable = false, foreignKey = @ForeignKey(name = "fk_issue_reporter"))
    private User reporter;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false, foreignKey = @ForeignKey(name = "fk_issue_category"))
    private IssueCategory category;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "location_id", nullable = false, foreignKey = @ForeignKey(name = "fk_issue_location"))
    private Location location;

    @NotBlank
    @Size(min = 5, max = 150)
    @Column(nullable = false, length = 150)
    private String title;

    @NotBlank
    @Size(min = 10, max = 5000)
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private IssueStatus status = IssueStatus.REPORTED;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private IssuePriority priority = IssuePriority.MEDIUM;

    @Column(name = "upvote_count", nullable = false)
    private Integer upvoteCount = 1;

    @Column(name = "comment_count", nullable = false)
    private Integer commentCount = 0;

    @NotNull
    @Column(name = "sla_deadline", nullable = false)
    private LocalDateTime slaDeadline;

    @OneToMany(mappedBy = "issue", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<IssuePhoto> photos = new ArrayList<>();

    @OneToMany(mappedBy = "issue", cascade = CascadeType.ALL)
    @OrderBy("createdAt ASC")
    private List<IssueStatusHistory> statusHistory = new ArrayList<>();

    @OneToMany(mappedBy = "issue", cascade = CascadeType.ALL)
    private List<Assignment> assignments = new ArrayList<>();

    @OneToOne(mappedBy = "issue", cascade = CascadeType.ALL)
    private ResolutionProof resolutionProof;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
```

### 9.2 Java Spring Data REST Repository: `IssueRepository.java`

```java
package com.civicfix.backend.repository;

import com.civicfix.backend.model.Issue;
import com.civicfix.backend.model.IssueStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {

    Optional<Issue> findByIssueCode(String issueCode);

    Page<Issue> findByStatus(IssueStatus status, Pageable pageable);

    @Query("SELECT i FROM Issue i JOIN i.location l WHERE l.ward = :ward AND i.status = :status")
    Page<Issue> findByWardAndStatus(@Param("ward") String ward, @Param("status") IssueStatus status, Pageable pageable);

    @Query(value = "SELECT i.* FROM issues i " +
                   "JOIN locations l ON i.location_id = l.id " +
                   "WHERE ST_Distance_Sphere(l.geo_point, ST_SRID(POINT(:lng, :lat), 4326)) <= :radiusMeters",
           nativeQuery = true)
    Page<Issue> findNearbyIssues(@Param("lat") double lat, 
                                 @Param("lng") double lng, 
                                 @Param("radiusMeters") double radiusMeters, 
                                 Pageable pageable);
}
```

---

*This concludes Phase 1: Database Architecture and Specification for CivicFix.*
