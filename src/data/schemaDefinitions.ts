import { TableSchemaMetadata } from '../types/database';

export const CIVICFIX_SCHEMAS: TableSchemaMetadata[] = [
  {
    tableName: 'users',
    displayName: 'Users',
    description: 'Central identity registry for citizens, field maintenance crews, municipal dispatchers, supervisors, and administrators.',
    primaryKey: 'id',
    javaEntityName: 'User.java',
    normalizationNotes: '3NF compliant. Decoupled from departmental hierarchy, supporting role-based segregation.',
    columns: [
      { name: 'id', mysqlType: 'BIGINT UNSIGNED', javaType: 'Long', isPrimaryKey: true, isForeignKey: false, isNullable: false, constraints: ['AUTO_INCREMENT', 'PRIMARY KEY'], description: 'Surrogate primary key' },
      { name: 'email', mysqlType: 'VARCHAR(255)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: false, constraints: ['UNIQUE', 'NOT NULL'], description: 'Unique citizen or staff corporate login email' },
      { name: 'password_hash', mysqlType: 'VARCHAR(255)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: false, constraints: ['NOT NULL', 'BCrypt/Argon2id'], description: 'Cryptographic hash with salt' },
      { name: 'full_name', mysqlType: 'VARCHAR(120)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: false, constraints: ['NOT NULL'], description: 'Citizen or staff display name' },
      { name: 'phone_number', mysqlType: 'VARCHAR(30)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: true, constraints: ['UNIQUE', 'E.164 format'], description: 'Contact phone for SMS dispatch updates' },
      { name: 'role', mysqlType: 'ENUM', javaType: 'UserRole', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: "'CITIZEN'", constraints: ['CITIZEN, FIELD_WORKER, DISPATCHER, SUPERVISOR, ADMIN'], description: 'Authorization privilege level' },
      { name: 'status', mysqlType: 'ENUM', javaType: 'UserStatus', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: "'ACTIVE'", constraints: ['ACTIVE, SUSPENDED, PENDING_VERIFICATION'], description: 'Account operational status' },
      { name: 'department', mysqlType: 'VARCHAR(100)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: true, constraints: ['NULL for citizen'], description: 'Municipal department (e.g. Public Works)' },
      { name: 'employee_badge_no', mysqlType: 'VARCHAR(50)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: true, constraints: ['UNIQUE where not null'], description: 'Municipal employee badge identifier' },
      { name: 'avatar_url', mysqlType: 'VARCHAR(512)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: true, constraints: ['URL format'], description: 'Profile avatar image CDN URL' },
      { name: 'created_at', mysqlType: 'DATETIME(6)', javaType: 'LocalDateTime', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: 'CURRENT_TIMESTAMP(6)', constraints: ['NOT NULL', 'IMMUTABLE'], description: 'Account creation audit timestamp' },
      { name: 'updated_at', mysqlType: 'DATETIME(6)', javaType: 'LocalDateTime', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: 'CURRENT_TIMESTAMP(6) ON UPDATE', constraints: ['NOT NULL'], description: 'Last profile mutation timestamp' }
    ],
    indexes: [
      { name: 'PRIMARY', type: 'PRIMARY', columns: ['id'], purpose: 'Clustered B-Tree index on surrogate key' },
      { name: 'uq_users_email', type: 'UNIQUE', columns: ['email'], purpose: 'Fast authentication lookups by email' },
      { name: 'uq_users_phone', type: 'UNIQUE', columns: ['phone_number'], purpose: 'Fast SMS dispatch resolution' },
      { name: 'idx_users_role_status', type: 'BTREE', columns: ['role', 'status'], purpose: 'Filter active field workers during dispatch' },
      { name: 'idx_users_department', type: 'BTREE', columns: ['department'], purpose: 'Department roster lookups' }
    ],
    foreignKeys: []
  },
  {
    tableName: 'issue_categories',
    displayName: 'Issue Categories',
    description: 'Municipal taxonomy defining civic grievance types, target departments, default severity, and resolution SLAs.',
    primaryKey: 'id',
    javaEntityName: 'IssueCategory.java',
    normalizationNotes: '3NF lookup table preventing duplicate department definitions and SLA rule redundancies.',
    columns: [
      { name: 'id', mysqlType: 'BIGINT UNSIGNED', javaType: 'Long', isPrimaryKey: true, isForeignKey: false, isNullable: false, constraints: ['AUTO_INCREMENT', 'PRIMARY KEY'], description: 'Surrogate primary key' },
      { name: 'code', mysqlType: 'VARCHAR(50)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: false, constraints: ['UNIQUE', 'NOT NULL'], description: 'Machine code token (e.g., ROAD_POTHOLE)' },
      { name: 'name', mysqlType: 'VARCHAR(100)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: false, constraints: ['NOT NULL'], description: 'Citizen-facing category title' },
      { name: 'description', mysqlType: 'TEXT', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: true, constraints: ['Max 1000 chars'], description: 'Guidelines on what issues qualify' },
      { name: 'target_department', mysqlType: 'VARCHAR(100)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: false, constraints: ['NOT NULL'], description: 'Municipal department responsible for triage' },
      { name: 'default_priority', mysqlType: 'ENUM', javaType: 'IssuePriority', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: "'MEDIUM'", constraints: ['LOW, MEDIUM, HIGH, CRITICAL'], description: 'Baseline triage severity rating' },
      { name: 'default_sla_hours', mysqlType: 'INT UNSIGNED', javaType: 'Integer', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: '72', constraints: ['CHECK (default_sla_hours > 0)'], description: 'Maximum permitted resolution time window' },
      { name: 'icon_name', mysqlType: 'VARCHAR(60)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: "'AlertCircle'", constraints: ['Lucide icon id'], description: 'Frontend visual iconography' },
      { name: 'color_hex', mysqlType: 'VARCHAR(7)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: "'#3B82F6'", constraints: ['Hex color regex'], description: 'Badge UI accent color' },
      { name: 'is_active', mysqlType: 'BOOLEAN', javaType: 'Boolean', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: 'TRUE', constraints: ['NOT NULL'], description: 'Soft-disable flag without breaking FKs' },
      { name: 'created_at', mysqlType: 'DATETIME(6)', javaType: 'LocalDateTime', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: 'CURRENT_TIMESTAMP(6)', constraints: ['NOT NULL'], description: 'Category introduction timestamp' }
    ],
    indexes: [
      { name: 'PRIMARY', type: 'PRIMARY', columns: ['id'], purpose: 'Surrogate clustered index' },
      { name: 'uq_categories_code', type: 'UNIQUE', columns: ['code'], purpose: 'Prevents duplicate taxonomic machine codes' },
      { name: 'idx_categories_active_prio', type: 'BTREE', columns: ['is_active', 'default_priority'], purpose: 'Fast filtering in reporting dropdowns' }
    ],
    foreignKeys: []
  },
  {
    tableName: 'locations',
    displayName: 'Locations',
    description: 'Spatial and civic geocoded coordinates with MySQL 8.0 native POINT GIS datatypes and administrative ward mapping.',
    primaryKey: 'id',
    javaEntityName: 'Location.java',
    normalizationNotes: 'Separated from issues to allow spatial point indexing and multi-incident clustering on identical coordinates.',
    columns: [
      { name: 'id', mysqlType: 'BIGINT UNSIGNED', javaType: 'Long', isPrimaryKey: true, isForeignKey: false, isNullable: false, constraints: ['AUTO_INCREMENT', 'PRIMARY KEY'], description: 'Surrogate location identifier' },
      { name: 'latitude', mysqlType: 'DECIMAL(10, 8)', javaType: 'BigDecimal', isPrimaryKey: false, isForeignKey: false, isNullable: false, constraints: ['CHECK (latitude BETWEEN -90 AND 90)'], description: 'WGS84 latitude coordinate' },
      { name: 'longitude', mysqlType: 'DECIMAL(11, 8)', javaType: 'BigDecimal', isPrimaryKey: false, isForeignKey: false, isNullable: false, constraints: ['CHECK (longitude BETWEEN -180 AND 180)'], description: 'WGS84 longitude coordinate' },
      { name: 'geo_point', mysqlType: 'POINT (SRID 4326)', javaType: 'org.locationtech.jts.geom.Point', isPrimaryKey: false, isForeignKey: false, isNullable: false, constraints: ['SRID 4326', 'SPATIAL NOT NULL'], description: 'Spatial GIS geometry for R-Tree index' },
      { name: 'formatted_address', mysqlType: 'VARCHAR(255)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: false, constraints: ['NOT NULL'], description: 'Standardized reverse-geocoded address' },
      { name: 'street_number', mysqlType: 'VARCHAR(30)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: true, constraints: [], description: 'Building or house number' },
      { name: 'route', mysqlType: 'VARCHAR(120)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: true, constraints: [], description: 'Street or thoroughfare name' },
      { name: 'neighborhood', mysqlType: 'VARCHAR(100)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: true, constraints: [], description: 'Sub-locality or community neighborhood' },
      { name: 'ward', mysqlType: 'VARCHAR(60)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: false, constraints: ['NOT NULL'], description: 'Municipal council ward or district' },
      { name: 'city', mysqlType: 'VARCHAR(100)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: "'Metropolis'", constraints: ['NOT NULL'], description: 'City authority' },
      { name: 'state', mysqlType: 'VARCHAR(50)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: false, constraints: ['NOT NULL'], description: 'State or province' },
      { name: 'postal_code', mysqlType: 'VARCHAR(20)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: false, constraints: ['NOT NULL'], description: 'ZIP / postal code' },
      { name: 'landmark', mysqlType: 'VARCHAR(150)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: true, constraints: [], description: 'Visual or civic landmark indicator' },
      { name: 'created_at', mysqlType: 'DATETIME(6)', javaType: 'LocalDateTime', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: 'CURRENT_TIMESTAMP(6)', constraints: ['NOT NULL'], description: 'Geocoding timestamp' }
    ],
    indexes: [
      { name: 'PRIMARY', type: 'PRIMARY', columns: ['id'], purpose: 'Primary clustered index' },
      { name: 'sp_idx_locations_geopoint', type: 'SPATIAL', columns: ['geo_point'], purpose: 'Spatial R-Tree for radius proximity & boundary search' },
      { name: 'idx_locations_ward_city', type: 'BTREE', columns: ['ward', 'city'], purpose: 'Council ward aggregations and departmental zoning' },
      { name: 'idx_locations_lat_lng', type: 'BTREE', columns: ['latitude', 'longitude'], purpose: 'Quick bounding box coordinate comparisons' }
    ],
    foreignKeys: []
  },
  {
    tableName: 'issues',
    displayName: 'Issues (Core Entity)',
    description: 'The core operational entity tracking reported civic grievances, their status, urgency, deadlines, and cached counts.',
    primaryKey: 'id',
    javaEntityName: 'Issue.java',
    normalizationNotes: 'BCNF compliant. Intentionally denormalizes upvote_count and comment_count for rapid list feed rendering.',
    columns: [
      { name: 'id', mysqlType: 'BIGINT UNSIGNED', javaType: 'Long', isPrimaryKey: true, isForeignKey: false, isNullable: false, constraints: ['AUTO_INCREMENT', 'PRIMARY KEY'], description: 'Surrogate primary key' },
      { name: 'issue_code', mysqlType: 'VARCHAR(32)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: false, constraints: ['UNIQUE', 'NOT NULL'], description: 'Human-readable citizen tracking token (e.g. CVX-2026-08491)' },
      { name: 'reporter_id', mysqlType: 'BIGINT UNSIGNED', javaType: 'Long', isPrimaryKey: false, isForeignKey: true, fkTarget: 'users(id)', isNullable: false, constraints: ['FK -> users(id)'], description: 'Reporting citizen identity' },
      { name: 'category_id', mysqlType: 'BIGINT UNSIGNED', javaType: 'Long', isPrimaryKey: false, isForeignKey: true, fkTarget: 'issue_categories(id)', isNullable: false, constraints: ['FK -> issue_categories(id)'], description: 'Categorical classification' },
      { name: 'location_id', mysqlType: 'BIGINT UNSIGNED', javaType: 'Long', isPrimaryKey: false, isForeignKey: true, fkTarget: 'locations(id)', isNullable: false, constraints: ['FK -> locations(id)'], description: 'Physical geospatial location' },
      { name: 'title', mysqlType: 'VARCHAR(150)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: false, constraints: ['LENGTH 5-150', 'NOT NULL'], description: 'Headline summary of the problem' },
      { name: 'description', mysqlType: 'TEXT', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: false, constraints: ['LENGTH 10-5000', 'NOT NULL'], description: 'Citizen narrative description of issue' },
      { name: 'status', mysqlType: 'ENUM', javaType: 'IssueStatus', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: "'REPORTED'", constraints: ['REPORTED, UNDER_REVIEW, ASSIGNED, IN_PROGRESS, RESOLVED, VERIFIED, REJECTED, REOPENED'], description: 'Current lifecycle state' },
      { name: 'priority', mysqlType: 'ENUM', javaType: 'IssuePriority', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: "'MEDIUM'", constraints: ['LOW, MEDIUM, HIGH, CRITICAL'], description: 'Assigned triage priority' },
      { name: 'visibility', mysqlType: 'ENUM', javaType: 'IssueVisibility', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: "'PUBLIC'", constraints: ['PUBLIC, CONFIDENTIAL'], description: 'Public visibility flag' },
      { name: 'upvote_count', mysqlType: 'INT UNSIGNED', javaType: 'Integer', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: '1', constraints: ['CHECK (upvote_count >= 0)'], description: 'Denormalized citizen support tally' },
      { name: 'comment_count', mysqlType: 'INT UNSIGNED', javaType: 'Integer', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: '0', constraints: ['CHECK (comment_count >= 0)'], description: 'Denormalized discussion comment tally' },
      { name: 'sla_deadline', mysqlType: 'DATETIME(6)', javaType: 'LocalDateTime', isPrimaryKey: false, isForeignKey: false, isNullable: false, constraints: ['NOT NULL'], description: 'Mandatory resolution SLA timestamp' },
      { name: 'resolved_at', mysqlType: 'DATETIME(6)', javaType: 'LocalDateTime', isPrimaryKey: false, isForeignKey: false, isNullable: true, constraints: ['Set on RESOLVED'], description: 'Timestamp field crew finished repair' },
      { name: 'closed_at', mysqlType: 'DATETIME(6)', javaType: 'LocalDateTime', isPrimaryKey: false, isForeignKey: false, isNullable: true, constraints: ['Set on VERIFIED'], description: 'Timestamp supervisor or citizen verified' },
      { name: 'created_at', mysqlType: 'DATETIME(6)', javaType: 'LocalDateTime', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: 'CURRENT_TIMESTAMP(6)', constraints: ['NOT NULL'], description: 'Initial filing timestamp' },
      { name: 'updated_at', mysqlType: 'DATETIME(6)', javaType: 'LocalDateTime', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: 'CURRENT_TIMESTAMP(6) ON UPDATE', constraints: ['NOT NULL'], description: 'Last issue modification timestamp' }
    ],
    indexes: [
      { name: 'PRIMARY', type: 'PRIMARY', columns: ['id'], purpose: 'Surrogate primary key' },
      { name: 'uq_issues_code', type: 'UNIQUE', columns: ['issue_code'], purpose: 'Fast lookup by tracking code' },
      { name: 'idx_issues_status_prio', type: 'BTREE', columns: ['status', 'priority'], purpose: 'Dashboard queues for pending high-priority triage' },
      { name: 'idx_issues_category_status', type: 'BTREE', columns: ['category_id', 'status'], purpose: 'Departmental status breakdowns' },
      { name: 'idx_issues_reporter', type: 'BTREE', columns: ['reporter_id'], purpose: 'Citizen "My Reported Issues" view' },
      { name: 'idx_issues_location', type: 'BTREE', columns: ['location_id'], purpose: 'Join optimization with locations' },
      { name: 'idx_issues_created_at', type: 'BTREE', columns: ['created_at DESC'], purpose: 'Recent activity sorting' },
      { name: 'ft_issues_search', type: 'FULLTEXT', columns: ['title', 'description'], purpose: 'Natural language search on civic issues' }
    ],
    foreignKeys: [
      { column: 'reporter_id', targetTable: 'users', targetColumn: 'id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' },
      { column: 'category_id', targetTable: 'issue_categories', targetColumn: 'id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' },
      { column: 'location_id', targetTable: 'locations', targetColumn: 'id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' }
    ]
  },
  {
    tableName: 'issue_photos',
    displayName: 'Issue Photos',
    description: 'Initial photographic evidence submitted with civic reports, including camera EXIF GPS verification and deduplication hashes.',
    primaryKey: 'id',
    javaEntityName: 'IssuePhoto.java',
    normalizationNotes: '1NF compliant. De-embedded from issues into separate table supporting multiple photographic views per issue.',
    columns: [
      { name: 'id', mysqlType: 'BIGINT UNSIGNED', javaType: 'Long', isPrimaryKey: true, isForeignKey: false, isNullable: false, constraints: ['AUTO_INCREMENT', 'PRIMARY KEY'], description: 'Photo surrogate identifier' },
      { name: 'issue_id', mysqlType: 'BIGINT UNSIGNED', javaType: 'Long', isPrimaryKey: false, isForeignKey: true, fkTarget: 'issues(id)', isNullable: false, constraints: ['FK -> issues(id)'], description: 'Parent issue' },
      { name: 'photo_url', mysqlType: 'VARCHAR(512)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: false, constraints: ['NOT NULL', 'URL format'], description: 'High-res image CDN path' },
      { name: 'thumbnail_url', mysqlType: 'VARCHAR(512)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: false, constraints: ['NOT NULL', 'URL format'], description: 'Mobile optimized thumbnail' },
      { name: 'caption', mysqlType: 'VARCHAR(200)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: true, constraints: ['Max 200 chars'], description: 'Citizen image description' },
      { name: 'gps_lat', mysqlType: 'DECIMAL(10, 8)', javaType: 'BigDecimal', isPrimaryKey: false, isForeignKey: false, isNullable: true, constraints: [], description: 'Extracted EXIF latitude for tamper check' },
      { name: 'gps_lng', mysqlType: 'DECIMAL(11, 8)', javaType: 'BigDecimal', isPrimaryKey: false, isForeignKey: false, isNullable: true, constraints: [], description: 'Extracted EXIF longitude for tamper check' },
      { name: 'display_order', mysqlType: 'TINYINT UNSIGNED', javaType: 'Integer', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: '1', constraints: ['CHECK (display_order BETWEEN 1 AND 10)'], description: 'Sequence in gallery' },
      { name: 'file_size_bytes', mysqlType: 'BIGINT UNSIGNED', javaType: 'Long', isPrimaryKey: false, isForeignKey: false, isNullable: false, constraints: ['CHECK (file_size_bytes <= 15728640)'], description: 'Image size in bytes (max 15MB)' },
      { name: 'mime_type', mysqlType: 'VARCHAR(50)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: "'image/jpeg'", constraints: ['image/jpeg, image/png, image/webp'], description: 'File MIME type' },
      { name: 'sha256_hash', mysqlType: 'CHAR(64)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: false, constraints: ['HEX 64 chars'], description: 'Integrity hash & duplicate detector' },
      { name: 'captured_at', mysqlType: 'DATETIME(6)', javaType: 'LocalDateTime', isPrimaryKey: false, isForeignKey: false, isNullable: true, constraints: [], description: 'EXIF camera shutter timestamp' },
      { name: 'uploaded_at', mysqlType: 'DATETIME(6)', javaType: 'LocalDateTime', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: 'CURRENT_TIMESTAMP(6)', constraints: ['NOT NULL'], description: 'Upload ingestion timestamp' }
    ],
    indexes: [
      { name: 'PRIMARY', type: 'PRIMARY', columns: ['id'], purpose: 'Surrogate primary key' },
      { name: 'idx_photos_issue_order', type: 'BTREE', columns: ['issue_id', 'display_order'], purpose: 'Ordered gallery loading for issue detail' },
      { name: 'idx_photos_hash', type: 'BTREE', columns: ['sha256_hash'], purpose: 'Detect spam or identical uploaded images' }
    ],
    foreignKeys: [
      { column: 'issue_id', targetTable: 'issues', targetColumn: 'id', onDelete: 'CASCADE', onUpdate: 'CASCADE' }
    ]
  },
  {
    tableName: 'issue_status_history',
    displayName: 'Issue Status History (Audit Trail)',
    description: 'Immutable ledger recording every lifecycle transition of an issue, providing full municipal accountability and legal transparency.',
    primaryKey: 'id',
    javaEntityName: 'IssueStatusHistory.java',
    normalizationNotes: 'Append-only audit log pattern. No UPDATE or DELETE operations permitted.',
    columns: [
      { name: 'id', mysqlType: 'BIGINT UNSIGNED', javaType: 'Long', isPrimaryKey: true, isForeignKey: false, isNullable: false, constraints: ['AUTO_INCREMENT', 'PRIMARY KEY'], description: 'Audit log identifier' },
      { name: 'issue_id', mysqlType: 'BIGINT UNSIGNED', javaType: 'Long', isPrimaryKey: false, isForeignKey: true, fkTarget: 'issues(id)', isNullable: false, constraints: ['FK -> issues(id)'], description: 'Target issue reference' },
      { name: 'previous_status', mysqlType: 'VARCHAR(30)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: true, constraints: ['NULL on creation'], description: 'Prior state' },
      { name: 'new_status', mysqlType: 'VARCHAR(30)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: false, constraints: ['NOT NULL'], description: 'Transition destination state' },
      { name: 'changed_by_user_id', mysqlType: 'BIGINT UNSIGNED', javaType: 'Long', isPrimaryKey: false, isForeignKey: true, fkTarget: 'users(id)', isNullable: false, constraints: ['FK -> users(id)'], description: 'Actor who triggered transition' },
      { name: 'reason_or_notes', mysqlType: 'TEXT', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: true, constraints: ['Max 2000 chars'], description: 'Explanation or justification for change' },
      { name: 'change_trigger', mysqlType: 'VARCHAR(50)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: "'MANUAL_DISPATCH'", constraints: ['NOT NULL'], description: 'Event source (e.g. WORKER_CHECK_IN)' },
      { name: 'created_at', mysqlType: 'DATETIME(6)', javaType: 'LocalDateTime', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: 'CURRENT_TIMESTAMP(6)', constraints: ['NOT NULL', 'IMMUTABLE'], description: 'Audit transition timestamp' }
    ],
    indexes: [
      { name: 'PRIMARY', type: 'PRIMARY', columns: ['id'], purpose: 'Surrogate primary key' },
      { name: 'idx_status_history_issue', type: 'BTREE', columns: ['issue_id', 'created_at ASC'], purpose: 'Render chronological timeline on issue detail view' },
      { name: 'idx_status_history_user', type: 'BTREE', columns: ['changed_by_user_id'], purpose: 'Audit worker and dispatcher actions' }
    ],
    foreignKeys: [
      { column: 'issue_id', targetTable: 'issues', targetColumn: 'id', onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      { column: 'changed_by_user_id', targetTable: 'users', targetColumn: 'id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' }
    ]
  },
  {
    tableName: 'assignments',
    displayName: 'Assignments (Field Dispatch)',
    description: 'Work orders dispatched to municipal maintenance crews or specialized contractors, tracking assignment deadlines and progress.',
    primaryKey: 'id',
    javaEntityName: 'Assignment.java',
    normalizationNotes: '3NF relation modeling M:N dispatch history between issues and field workers across departmental shifts.',
    columns: [
      { name: 'id', mysqlType: 'BIGINT UNSIGNED', javaType: 'Long', isPrimaryKey: true, isForeignKey: false, isNullable: false, constraints: ['AUTO_INCREMENT', 'PRIMARY KEY'], description: 'Assignment identifier' },
      { name: 'issue_id', mysqlType: 'BIGINT UNSIGNED', javaType: 'Long', isPrimaryKey: false, isForeignKey: true, fkTarget: 'issues(id)', isNullable: false, constraints: ['FK -> issues(id)'], description: 'Assigned civic issue' },
      { name: 'assigned_to_user_id', mysqlType: 'BIGINT UNSIGNED', javaType: 'Long', isPrimaryKey: false, isForeignKey: true, fkTarget: 'users(id)', isNullable: false, constraints: ['FK -> users(id)'], description: 'Field worker or crew leader' },
      { name: 'assigned_by_user_id', mysqlType: 'BIGINT UNSIGNED', javaType: 'Long', isPrimaryKey: false, isForeignKey: true, fkTarget: 'users(id)', isNullable: false, constraints: ['FK -> users(id)'], description: 'Municipal dispatcher who authorized assignment' },
      { name: 'department_name', mysqlType: 'VARCHAR(100)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: false, constraints: ['NOT NULL'], description: 'Responsible municipal department' },
      { name: 'assignment_status', mysqlType: 'ENUM', javaType: 'AssignmentStatus', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: "'ASSIGNED'", constraints: ['ASSIGNED, ACCEPTED, EN_ROUTE, ON_SITE, COMPLETED, REASSIGNED, CANCELLED'], description: 'Dispatch work order state' },
      { name: 'instructions', mysqlType: 'TEXT', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: true, constraints: ['Max 3000 chars'], description: 'Dispatcher guidance, equipment required' },
      { name: 'scheduled_for', mysqlType: 'DATETIME(6)', javaType: 'LocalDateTime', isPrimaryKey: false, isForeignKey: false, isNullable: true, constraints: [], description: 'Planned commencement time' },
      { name: 'deadline', mysqlType: 'DATETIME(6)', javaType: 'LocalDateTime', isPrimaryKey: false, isForeignKey: false, isNullable: false, constraints: ['NOT NULL'], description: 'Target resolution SLA deadline' },
      { name: 'completed_at', mysqlType: 'DATETIME(6)', javaType: 'LocalDateTime', isPrimaryKey: false, isForeignKey: false, isNullable: true, constraints: [], description: 'Worker check-out timestamp' },
      { name: 'created_at', mysqlType: 'DATETIME(6)', javaType: 'LocalDateTime', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: 'CURRENT_TIMESTAMP(6)', constraints: ['NOT NULL'], description: 'Work order dispatch timestamp' },
      { name: 'updated_at', mysqlType: 'DATETIME(6)', javaType: 'LocalDateTime', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: 'CURRENT_TIMESTAMP(6) ON UPDATE', constraints: ['NOT NULL'], description: 'Work order update timestamp' }
    ],
    indexes: [
      { name: 'PRIMARY', type: 'PRIMARY', columns: ['id'], purpose: 'Surrogate primary key' },
      { name: 'idx_assignments_worker_status', type: 'BTREE', columns: ['assigned_to_user_id', 'assignment_status'], purpose: 'Field worker active mobile task list' },
      { name: 'idx_assignments_issue', type: 'BTREE', columns: ['issue_id'], purpose: 'Lookup all dispatch orders for an issue' },
      { name: 'idx_assignments_deadline', type: 'BTREE', columns: ['deadline ASC'], purpose: 'Monitor impending SLA breaches' }
    ],
    foreignKeys: [
      { column: 'issue_id', targetTable: 'issues', targetColumn: 'id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' },
      { column: 'assigned_to_user_id', targetTable: 'users', targetColumn: 'id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' },
      { column: 'assigned_by_user_id', targetTable: 'users', targetColumn: 'id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' }
    ]
  },
  {
    tableName: 'notifications',
    displayName: 'Notifications',
    description: 'System and multichannel communications alerting citizens of issue progress and alerting staff of urgent escalations.',
    primaryKey: 'id',
    javaEntityName: 'Notification.java',
    normalizationNotes: 'Decoupled from issue lifecycle; uses ON DELETE SET NULL on issue_id to prevent lost notifications.',
    columns: [
      { name: 'id', mysqlType: 'BIGINT UNSIGNED', javaType: 'Long', isPrimaryKey: true, isForeignKey: false, isNullable: false, constraints: ['AUTO_INCREMENT', 'PRIMARY KEY'], description: 'Notification identifier' },
      { name: 'user_id', mysqlType: 'BIGINT UNSIGNED', javaType: 'Long', isPrimaryKey: false, isForeignKey: true, fkTarget: 'users(id)', isNullable: false, constraints: ['FK -> users(id)'], description: 'Recipient user' },
      { name: 'issue_id', mysqlType: 'BIGINT UNSIGNED', javaType: 'Long', isPrimaryKey: false, isForeignKey: true, fkTarget: 'issues(id)', isNullable: true, constraints: ['FK -> issues(id)'], description: 'Related issue' },
      { name: 'title', mysqlType: 'VARCHAR(150)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: false, constraints: ['NOT NULL'], description: 'Alert headline' },
      { name: 'message', mysqlType: 'TEXT', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: false, constraints: ['NOT NULL'], description: 'Notification content text' },
      { name: 'notification_type', mysqlType: 'ENUM', javaType: 'NotificationType', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: "'STATUS_UPDATE'", constraints: ['STATUS_UPDATE, WORKER_ASSIGNED, COMMENT_ADDED, RESOLUTION_VERIFIED, SLA_BREACH_ALERT'], description: 'Category of alert' },
      { name: 'delivery_channel', mysqlType: 'ENUM', javaType: 'DeliveryChannel', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: "'IN_APP'", constraints: ['IN_APP, SMS, EMAIL, PUSH'], description: 'Delivery medium' },
      { name: 'is_read', mysqlType: 'BOOLEAN', javaType: 'Boolean', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: 'FALSE', constraints: ['NOT NULL'], description: 'Read acknowledgment state' },
      { name: 'read_at', mysqlType: 'DATETIME(6)', javaType: 'LocalDateTime', isPrimaryKey: false, isForeignKey: false, isNullable: true, constraints: [], description: 'Timestamp citizen opened notification' },
      { name: 'created_at', mysqlType: 'DATETIME(6)', javaType: 'LocalDateTime', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: 'CURRENT_TIMESTAMP(6)', constraints: ['NOT NULL'], description: 'Alert dispatch timestamp' }
    ],
    indexes: [
      { name: 'PRIMARY', type: 'PRIMARY', columns: ['id'], purpose: 'Surrogate primary key' },
      { name: 'idx_notifs_user_read', type: 'BTREE', columns: ['user_id', 'is_read', 'created_at DESC'], purpose: 'Unread badge count and user inbox pagination' }
    ],
    foreignKeys: [
      { column: 'user_id', targetTable: 'users', targetColumn: 'id', onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      { column: 'issue_id', targetTable: 'issues', targetColumn: 'id', onDelete: 'SET NULL', onUpdate: 'CASCADE' }
    ]
  },
  {
    tableName: 'comments',
    displayName: 'Comments & Internal Notes',
    description: 'Threaded civic discussions between citizens and staff, supporting private department-only notes.',
    primaryKey: 'id',
    javaEntityName: 'Comment.java',
    normalizationNotes: '3NF design separating discussion threads from issue metadata, with flag for departmental privacy.',
    columns: [
      { name: 'id', mysqlType: 'BIGINT UNSIGNED', javaType: 'Long', isPrimaryKey: true, isForeignKey: false, isNullable: false, constraints: ['AUTO_INCREMENT', 'PRIMARY KEY'], description: 'Comment surrogate identifier' },
      { name: 'issue_id', mysqlType: 'BIGINT UNSIGNED', javaType: 'Long', isPrimaryKey: false, isForeignKey: true, fkTarget: 'issues(id)', isNullable: false, constraints: ['FK -> issues(id)'], description: 'Target issue thread' },
      { name: 'user_id', mysqlType: 'BIGINT UNSIGNED', javaType: 'Long', isPrimaryKey: false, isForeignKey: true, fkTarget: 'users(id)', isNullable: false, constraints: ['FK -> users(id)'], description: 'Author of comment' },
      { name: 'content', mysqlType: 'TEXT', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: false, constraints: ['LENGTH 1-2000', 'NOT NULL'], description: 'Message body' },
      { name: 'is_internal_note', mysqlType: 'BOOLEAN', javaType: 'Boolean', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: 'FALSE', constraints: ['NOT NULL'], description: 'Staff-only visibility guard' },
      { name: 'is_flagged', mysqlType: 'BOOLEAN', javaType: 'Boolean', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: 'FALSE', constraints: ['NOT NULL'], description: 'Citizen moderation flag' },
      { name: 'created_at', mysqlType: 'DATETIME(6)', javaType: 'LocalDateTime', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: 'CURRENT_TIMESTAMP(6)', constraints: ['NOT NULL'], description: 'Submission timestamp' },
      { name: 'updated_at', mysqlType: 'DATETIME(6)', javaType: 'LocalDateTime', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: 'CURRENT_TIMESTAMP(6) ON UPDATE', constraints: ['NOT NULL'], description: 'Edit timestamp' }
    ],
    indexes: [
      { name: 'PRIMARY', type: 'PRIMARY', columns: ['id'], purpose: 'Primary clustered index' },
      { name: 'idx_comments_issue_internal', type: 'BTREE', columns: ['issue_id', 'is_internal_note', 'created_at ASC'], purpose: 'Render chronological comment thread with staff visibility filter' },
      { name: 'idx_comments_user', type: 'BTREE', columns: ['user_id'], purpose: 'Citizen comment history lookup' }
    ],
    foreignKeys: [
      { column: 'issue_id', targetTable: 'issues', targetColumn: 'id', onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      { column: 'user_id', targetTable: 'users', targetColumn: 'id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' }
    ]
  },
  {
    tableName: 'resolution_proof',
    displayName: 'Resolution Proof',
    description: 'Evidentiary verification dossier demonstrating repair completion, with after-repair photographs, labor expenditure, and citizen sign-off.',
    primaryKey: 'id',
    javaEntityName: 'ResolutionProof.java',
    normalizationNotes: 'Strict 1:1 (or 1:0..1) relationship enforced via UNIQUE constraint on issue_id.',
    columns: [
      { name: 'id', mysqlType: 'BIGINT UNSIGNED', javaType: 'Long', isPrimaryKey: true, isForeignKey: false, isNullable: false, constraints: ['AUTO_INCREMENT', 'PRIMARY KEY'], description: 'Proof record identifier' },
      { name: 'issue_id', mysqlType: 'BIGINT UNSIGNED', javaType: 'Long', isPrimaryKey: false, isForeignKey: true, fkTarget: 'issues(id)', isNullable: false, constraints: ['UNIQUE', 'FK -> issues(id)'], description: 'Guarantees 1-to-1 link with resolved issue' },
      { name: 'worker_id', mysqlType: 'BIGINT UNSIGNED', javaType: 'Long', isPrimaryKey: false, isForeignKey: true, fkTarget: 'users(id)', isNullable: false, constraints: ['FK -> users(id)'], description: 'Field worker who finished repair' },
      { name: 'verified_by_user_id', mysqlType: 'BIGINT UNSIGNED', javaType: 'Long', isPrimaryKey: false, isForeignKey: true, fkTarget: 'users(id)', isNullable: true, constraints: ['FK -> users(id)'], description: 'Supervisor or citizen signing off' },
      { name: 'work_description', mysqlType: 'TEXT', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: false, constraints: ['MIN 20 chars', 'NOT NULL'], description: 'Technical narrative of repair operations' },
      { name: 'before_photo_url', mysqlType: 'VARCHAR(512)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: false, constraints: ['URL format'], description: 'Pre-repair visual reference' },
      { name: 'after_photo_url', mysqlType: 'VARCHAR(512)', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: false, constraints: ['URL format'], description: 'Post-repair photographic evidence' },
      { name: 'labor_hours', mysqlType: 'DECIMAL(5, 2)', javaType: 'BigDecimal', isPrimaryKey: false, isForeignKey: false, isNullable: true, constraints: ['CHECK (labor_hours >= 0)'], description: 'Work hours spent by crew' },
      { name: 'materials_cost', mysqlType: 'DECIMAL(10, 2)', javaType: 'BigDecimal', isPrimaryKey: false, isForeignKey: false, isNullable: true, constraints: ['CHECK (materials_cost >= 0)'], description: 'Municipal expenditure ($ USD)' },
      { name: 'verification_status', mysqlType: 'ENUM', javaType: 'VerificationStatus', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: "'PENDING_REVIEW'", constraints: ['PENDING_REVIEW, APPROVED, REJECTED, CITIZEN_DISPUTED'], description: 'Sign-off state' },
      { name: 'citizen_feedback', mysqlType: 'TEXT', javaType: 'String', isPrimaryKey: false, isForeignKey: false, isNullable: true, constraints: ['Max 1000 chars'], description: 'Citizen quality feedback' },
      { name: 'citizen_rating', mysqlType: 'TINYINT UNSIGNED', javaType: 'Integer', isPrimaryKey: false, isForeignKey: false, isNullable: true, constraints: ['CHECK (citizen_rating BETWEEN 1 AND 5)'], description: '1 to 5 star rating' },
      { name: 'verified_at', mysqlType: 'DATETIME(6)', javaType: 'LocalDateTime', isPrimaryKey: false, isForeignKey: false, isNullable: true, constraints: [], description: 'Official sign-off timestamp' },
      { name: 'created_at', mysqlType: 'DATETIME(6)', javaType: 'LocalDateTime', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: 'CURRENT_TIMESTAMP(6)', constraints: ['NOT NULL'], description: 'Proof submission timestamp' },
      { name: 'updated_at', mysqlType: 'DATETIME(6)', javaType: 'LocalDateTime', isPrimaryKey: false, isForeignKey: false, isNullable: false, defaultValue: 'CURRENT_TIMESTAMP(6) ON UPDATE', constraints: ['NOT NULL'], description: 'Last revision timestamp' }
    ],
    indexes: [
      { name: 'PRIMARY', type: 'PRIMARY', columns: ['id'], purpose: 'Surrogate primary key' },
      { name: 'uq_res_proof_issue', type: 'UNIQUE', columns: ['issue_id'], purpose: 'Enforces strictly 1 proof per issue' },
      { name: 'idx_res_proof_worker', type: 'BTREE', columns: ['worker_id'], purpose: 'Worker productivity and quality review' },
      { name: 'idx_res_proof_status', type: 'BTREE', columns: ['verification_status'], purpose: 'Supervisor pending sign-off queue' }
    ],
    foreignKeys: [
      { column: 'issue_id', targetTable: 'issues', targetColumn: 'id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' },
      { column: 'worker_id', targetTable: 'users', targetColumn: 'id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' },
      { column: 'verified_by_user_id', targetTable: 'users', targetColumn: 'id', onDelete: 'SET NULL', onUpdate: 'CASCADE' }
    ]
  }
];

export const MYSQL_VS_MONGO_FACTORS = [
  {
    criterion: 'ACID Transactions & Atomicity',
    winner: 'MySQL 8.0 (InnoDB)',
    mysqlScore: 10,
    mongoScore: 6,
    explanation: 'Civic issue status transitions must atomically create status history audit logs, update resolution proofs, and trigger notifications. MySQL handles multi-table ACID transactions natively with zero overhead.',
    civicFixImpact: 'CRITICAL: Prevents orphaned dispatches, partial updates, and illegal state transitions.'
  },
  {
    criterion: 'Referential Integrity & Constraints',
    winner: 'MySQL 8.0 (InnoDB)',
    mysqlScore: 10,
    mongoScore: 4,
    explanation: 'MySQL enforces engine-level FOREIGN KEYs with ON DELETE RESTRICT/CASCADE, preventing orphan issues when a citizen or category changes. MongoDB requires brittle application-level checks.',
    civicFixImpact: 'CRITICAL: Guarantees every issue maps to a valid geocoded location, category SLA, and reporting citizen.'
  },
  {
    criterion: 'Geospatial Querying & Spatial Indexing',
    winner: 'Tie / Slight MySQL Advantage for Municipal Boundaries',
    mysqlScore: 9,
    mongoScore: 9,
    explanation: 'Both engines offer spatial indexes (MySQL R-Tree with ST_Distance_Sphere vs Mongo 2dsphere). MySQL 8.0 complies with OGC spatial standards, ideal for municipal council ward polygons and point-in-polygon containment.',
    civicFixImpact: 'HIGH: Fast radius searching (find all potholes within 2km) and automatic ward council routing.'
  },
  {
    criterion: 'Audit Trail Immutability & Compliance',
    winner: 'MySQL 8.0 (InnoDB)',
    mysqlScore: 10,
    mongoScore: 6,
    explanation: 'MySQL allows granular DDL privilege revoking (e.g. REVOKE UPDATE, DELETE ON issue_status_history FROM app_user), guaranteeing tamper-proof audit trails for public administration review.',
    civicFixImpact: 'HIGH: Satisfies municipal public records compliance and ombudsman requirements.'
  },
  {
    criterion: 'Complex Analytics & Departmental SLAs',
    winner: 'MySQL 8.0 (InnoDB)',
    mysqlScore: 10,
    mongoScore: 6,
    explanation: 'Cross-ward multi-table joins, window functions (ROW_NUMBER, DENSE_RANK), and CTEs enable instantaneous reporting on field worker response times, category bottlenecks, and municipal expenditure.',
    civicFixImpact: 'HIGH: Powers the mayor and city council executive performance dashboards.'
  },
  {
    criterion: 'Enterprise Java / Spring Boot Ecosystem',
    winner: 'MySQL 8.0 (InnoDB)',
    mysqlScore: 10,
    mongoScore: 7,
    explanation: 'Spring Data JPA and Hibernate provide industry-standard object-relational mapping, declarative transaction management (@Transactional), and connection pooling (HikariCP).',
    civicFixImpact: 'HIGH: Direct alignment with Java backend architecture standard.'
  }
];
