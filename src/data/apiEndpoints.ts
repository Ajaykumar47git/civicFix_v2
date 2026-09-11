export interface ApiEndpointParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default?: string;
}

export interface ApiEndpoint {
  id: string;
  group: 'Authentication' | 'Citizen' | 'Public' | 'Admin';
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  description: string;
  authentication: string;
  requiredRole: string;
  pathVariables: ApiEndpointParam[];
  queryParams: ApiEndpointParam[];
  requestBody: any | null;
  requestContentType?: string;
  validationRules: string[];
  successStatus: number;
  successResponse: any;
  errorResponses: {
    status: number;
    title: string;
    description: string;
    sample: any;
  }[];
  httpStatusCodes: number[];
  sampleCurl: string;
}

export const API_ENDPOINTS: ApiEndpoint[] = [
  // -------------------------------------------------------------
  // GROUP 1: AUTHENTICATION
  // -------------------------------------------------------------
  {
    id: 'auth-register',
    group: 'Authentication',
    name: 'Register User',
    endpoint: '/api/v1/auth/register',
    method: 'POST',
    description: 'Registers a new citizen or municipal user with hashed password (bcrypt 12 salt rounds) and creates an initial profile.',
    authentication: 'None (Public)',
    requiredRole: 'None',
    pathVariables: [],
    queryParams: [],
    requestBody: {
      fullName: 'Maya Lin',
      email: 'maya.lin@civicmail.org',
      password: 'SecurePassword123!',
      phoneNumber: '+1-555-019-2834',
      role: 'CITIZEN',
      councilWard: 4
    },
    validationRules: [
      'fullName: Required, string 2-100 characters, letters/spaces/hyphens only.',
      'email: Required, RFC 5322 format, must be unique in database.',
      'password: Required, min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special character.',
      'phoneNumber: Optional, valid E.164 phone string.',
      'role: Optional (default CITIZEN). Cannot self-register as ADMIN or SUPERVISOR.',
      'councilWard: Optional, integer between 1 and 20.'
    ],
    successStatus: 201,
    successResponse: {
      success: true,
      message: 'User registered successfully. Confirmation email sent.',
      data: {
        user: {
          id: 142,
          fullName: 'Maya Lin',
          email: 'maya.lin@civicmail.org',
          role: 'CITIZEN',
          councilWard: 4,
          isVerified: false,
          createdAt: '2026-09-11T06:45:00.000Z'
        },
        tokens: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0Miwicm9sZSI6IkNJVElaRU4ifQ...',
          tokenType: 'Bearer',
          expiresIn: 900
        }
      }
    },
    errorResponses: [
      {
        status: 400,
        title: 'Bad Request',
        description: 'Missing required fields or malformed JSON.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/BAD_REQUEST',
          title: 'Bad Request',
          status: 400,
          detail: 'Field email is missing.'
        }
      },
      {
        status: 409,
        title: 'Conflict',
        description: 'Email already in use.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/EMAIL_EXISTS',
          title: 'Conflict',
          status: 409,
          detail: 'An account with email maya.lin@civicmail.org already exists.'
        }
      },
      {
        status: 422,
        title: 'Unprocessable Entity',
        description: 'Password complexity not met.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/WEAK_PASSWORD',
          title: 'Unprocessable Entity',
          status: 422,
          detail: 'Password must contain at least 1 uppercase and 1 special symbol.'
        }
      }
    ],
    httpStatusCodes: [201, 400, 409, 422, 500],
    sampleCurl: `curl -X POST https://api.civicfix.city.gov/api/v1/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"fullName":"Maya Lin","email":"maya.lin@civicmail.org","password":"SecurePassword123!","councilWard":4}'`
  },
  {
    id: 'auth-login',
    group: 'Authentication',
    name: 'Login User',
    endpoint: '/api/v1/auth/login',
    method: 'POST',
    description: 'Authenticates user credentials via bcrypt verification and issues a 15-minute JWT Access Token + HTTP-only secure Refresh Cookie (7 days).',
    authentication: 'None (Public)',
    requiredRole: 'None',
    pathVariables: [],
    queryParams: [],
    requestBody: {
      email: 'maya.lin@civicmail.org',
      password: 'SecurePassword123!'
    },
    validationRules: [
      'email: Required, non-empty valid email string.',
      'password: Required, non-empty string.'
    ],
    successStatus: 200,
    successResponse: {
      success: true,
      message: 'Authentication successful.',
      data: {
        user: {
          id: 142,
          fullName: 'Maya Lin',
          email: 'maya.lin@civicmail.org',
          role: 'CITIZEN',
          councilWard: 4,
          badgeNumber: null
        },
        tokens: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          tokenType: 'Bearer',
          expiresIn: 900
        }
      }
    },
    errorResponses: [
      {
        status: 401,
        title: 'Unauthorized',
        description: 'Invalid credentials.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/INVALID_CREDENTIALS',
          title: 'Unauthorized',
          status: 401,
          detail: 'Invalid email or password.'
        }
      },
      {
        status: 429,
        title: 'Too Many Requests',
        description: 'Account rate limited after 5 failed attempts.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/RATE_LIMITED',
          title: 'Too Many Requests',
          status: 429,
          detail: 'Too many failed login attempts. Please retry in 15 minutes.'
        }
      }
    ],
    httpStatusCodes: [200, 400, 401, 429, 500],
    sampleCurl: `curl -X POST https://api.civicfix.city.gov/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"maya.lin@civicmail.org","password":"SecurePassword123!"}'`
  },
  {
    id: 'auth-logout',
    group: 'Authentication',
    name: 'Logout User',
    endpoint: '/api/v1/auth/logout',
    method: 'POST',
    description: 'Invalidates the active refresh token in the PostgreSQL Prisma session store and clears the HTTP-only cookie.',
    authentication: 'Bearer JWT (Required)',
    requiredRole: 'Any Authenticated Role',
    pathVariables: [],
    queryParams: [],
    requestBody: null,
    validationRules: [
      'Authorization header with valid Bearer JWT is mandatory.'
    ],
    successStatus: 200,
    successResponse: {
      success: true,
      message: 'Session terminated successfully. Token invalidated.'
    },
    errorResponses: [
      {
        status: 401,
        title: 'Unauthorized',
        description: 'Missing or expired access token.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/UNAUTHORIZED',
          title: 'Unauthorized',
          status: 401,
          detail: 'Access token missing or expired.'
        }
      }
    ],
    httpStatusCodes: [200, 401, 500],
    sampleCurl: `curl -X POST https://api.civicfix.city.gov/api/v1/auth/logout \\
  -H "Authorization: Bearer <jwt_access_token>"`
  },
  {
    id: 'auth-refresh',
    group: 'Authentication',
    name: 'Refresh Token',
    endpoint: '/api/v1/auth/refresh-token',
    method: 'POST',
    description: 'Exchanges a valid, unrevoked Refresh Token for a fresh 15-minute JWT Access Token with automatic token rotation.',
    authentication: 'Refresh Token (Cookie or Body)',
    requiredRole: 'None',
    pathVariables: [],
    queryParams: [],
    requestBody: {
      refreshToken: 'd8f3e2a1-7c4b-4f9e-9a1d-2b3c4d5e6f7a'
    },
    validationRules: [
      'refreshToken: Required string (if not in HTTP-only cookie). Must match active hashed token in database.'
    ],
    successStatus: 200,
    successResponse: {
      success: true,
      message: 'Token refreshed successfully.',
      data: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0Mn0...',
        tokenType: 'Bearer',
        expiresIn: 900
      }
    },
    errorResponses: [
      {
        status: 401,
        title: 'Unauthorized',
        description: 'Refresh token expired or revoked.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/INVALID_TOKEN',
          title: 'Unauthorized',
          status: 401,
          detail: 'Refresh token expired.'
        }
      },
      {
        status: 403,
        title: 'Forbidden',
        description: 'Token reuse detected - all sessions revoked.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/TOKEN_REUSE',
          title: 'Forbidden',
          status: 403,
          detail: 'Suspicious token reuse detected. All sessions revoked.'
        }
      }
    ],
    httpStatusCodes: [200, 400, 401, 403, 500],
    sampleCurl: `curl -X POST https://api.civicfix.city.gov/api/v1/auth/refresh-token \\
  -H "Content-Type: application/json" \\
  -d '{"refreshToken":"d8f3e2a1-7c4b-4f9e-9a1d-2b3c4d5e6f7a"}'`
  },
  {
    id: 'auth-me',
    group: 'Authentication',
    name: 'Current User Profile',
    endpoint: '/api/v1/auth/me',
    method: 'GET',
    description: 'Retrieves profile, municipal role entitlements, department, and activity statistics for the authenticated user.',
    authentication: 'Bearer JWT (Required)',
    requiredRole: 'Any Authenticated Role',
    pathVariables: [],
    queryParams: [],
    requestBody: null,
    validationRules: [
      'Authorization header with valid Bearer JWT is mandatory.'
    ],
    successStatus: 200,
    successResponse: {
      success: true,
      data: {
        id: 142,
        fullName: 'Maya Lin',
        email: 'maya.lin@civicmail.org',
        phoneNumber: '+1-555-019-2834',
        role: 'CITIZEN',
        councilWard: 4,
        stats: {
          totalReportedIssues: 8,
          resolvedIssues: 6,
          pendingIssues: 2
        },
        createdAt: '2026-09-11T06:45:00.000Z'
      }
    },
    errorResponses: [
      {
        status: 401,
        title: 'Unauthorized',
        description: 'Invalid token.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/UNAUTHORIZED',
          title: 'Unauthorized',
          status: 401,
          detail: 'Bearer token expired or invalid.'
        }
      }
    ],
    httpStatusCodes: [200, 401, 404, 500],
    sampleCurl: `curl -X GET https://api.civicfix.city.gov/api/v1/auth/me \\
  -H "Authorization: Bearer <jwt_access_token>"`
  },

  // -------------------------------------------------------------
  // GROUP 2: CITIZEN
  // -------------------------------------------------------------
  {
    id: 'citizen-create-issue',
    group: 'Citizen',
    name: 'Create Issue',
    endpoint: '/api/v1/citizen/issues',
    method: 'POST',
    description: 'Submits a new civic infrastructure complaint with GPS coordinates, address, category, and automatic SLA turnaround deadline calculation.',
    authentication: 'Bearer JWT (Required)',
    requiredRole: 'CITIZEN (or staff)',
    pathVariables: [],
    queryParams: [],
    requestBody: {
      categoryId: 1,
      title: 'Severe Water Main Rupture Flooding Intersection',
      description: 'Continuous high-volume clean water surging through pavement fractures. Roadway substructure eroding rapidly.',
      priority: 'HIGH',
      address: '742 Evergreen Terrace, Sector 4',
      latitude: 37.7749,
      longitude: -122.4194,
      councilWard: 4,
      landmark: 'Directly opposite Central Elementary School gates',
      isPublic: true
    },
    validationRules: [
      'categoryId: Required positive integer referencing active issue_categories row.',
      'title: Required string 10 to 150 characters.',
      'description: Required string 20 to 2000 characters.',
      'priority: Optional enum (LOW, MEDIUM, HIGH, CRITICAL).',
      'address: Required string 5 to 255 characters.',
      'latitude: Required float -90 to 90 within municipal boundary.',
      'longitude: Required float -180 to 180 within municipal boundary.',
      'councilWard: Required integer 1 to 20.'
    ],
    successStatus: 201,
    successResponse: {
      success: true,
      message: 'Grievance logged successfully and queued for dispatch.',
      data: {
        id: 894,
        issueCode: 'CVX-2026-08142',
        title: 'Severe Water Main Rupture Flooding Intersection',
        status: 'REPORTED',
        priority: 'HIGH',
        category: {
          id: 1,
          name: 'Water & Sewage',
          targetDepartment: 'Department of Public Works - Water Distribution'
        },
        slaDeadline: '2026-09-12T06:45:00.000Z',
        slaHours: 24,
        upvoteCount: 1,
        createdAt: '2026-09-11T06:45:00.000Z'
      }
    },
    errorResponses: [
      {
        status: 400,
        title: 'Bad Request',
        description: 'GPS coordinates out of municipal boundary.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/INVALID_LOCATION',
          title: 'Bad Request',
          status: 400,
          detail: 'Coordinates fall outside municipal service boundaries.'
        }
      },
      {
        status: 422,
        title: 'Unprocessable Entity',
        description: 'Category ID inactive or not found.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/UNKNOWN_CATEGORY',
          title: 'Unprocessable Entity',
          status: 422,
          detail: 'CategoryId 999 does not exist.'
        }
      }
    ],
    httpStatusCodes: [201, 400, 401, 422, 500],
    sampleCurl: `curl -X POST https://api.civicfix.city.gov/api/v1/citizen/issues \\
  -H "Authorization: Bearer <jwt_access_token>" \\
  -H "Content-Type: application/json" \\
  -d '{"categoryId":1,"title":"Water Main Rupture","description":"Continuous water leak...","priority":"HIGH","address":"742 Evergreen Terrace","latitude":37.7749,"longitude":-122.4194,"councilWard":4}'`
  },
  {
    id: 'citizen-upload-photo',
    group: 'Citizen',
    name: 'Upload Issue Photo',
    endpoint: '/api/v1/issues/:id/photos',
    method: 'POST',
    description: 'Uploads photographic evidence via multipart/form-data. Computes SHA-256 hash for deduplication, extracts EXIF GPS metadata, and verifies proximity.',
    authentication: 'Bearer JWT (Required)',
    requiredRole: 'CITIZEN (Author) or ADMIN',
    pathVariables: [
      { name: 'id', type: 'integer', required: true, description: 'Unique Issue ID' }
    ],
    queryParams: [],
    requestBody: null,
    requestContentType: 'multipart/form-data (file: binary image, caption: string)',
    validationRules: [
      'id: Valid existing issue ID.',
      'file: Required binary file. Allowed MIME: image/jpeg, image/png, image/webp. Max 10MB.',
      'Max 5 photos allowed per issue.'
    ],
    successStatus: 201,
    successResponse: {
      success: true,
      message: 'Evidence photo uploaded and verified.',
      data: {
        photoId: 2048,
        issueId: 894,
        photoUrl: 'https://storage.civicfix.city.gov/evidence/2026/09/cvx-894-photo-1.jpg',
        thumbnailUrl: 'https://storage.civicfix.city.gov/evidence/2026/09/cvx-894-photo-1-thumb.jpg',
        fileSizeBytes: 2450890,
        mimeType: 'image/jpeg',
        sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        exifMetadata: {
          gpsLat: 37.774912,
          gpsLng: -122.419405,
          isLocationVerified: true
        },
        caption: 'Pavement collapse revealing eroded gravel sub-base'
      }
    },
    errorResponses: [
      {
        status: 403,
        title: 'Forbidden',
        description: 'User is not the author of this issue.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/FORBIDDEN',
          title: 'Forbidden',
          status: 403,
          detail: 'You are not authorized to attach photos to another citizen grievance.'
        }
      },
      {
        status: 413,
        title: 'Payload Too Large',
        description: 'Uploaded image file exceeds 10MB.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/PAYLOAD_TOO_LARGE',
          title: 'Payload Too Large',
          status: 413,
          detail: 'Uploaded image exceeds maximum allowable limit of 10MB.'
        }
      }
    ],
    httpStatusCodes: [201, 400, 401, 403, 404, 413, 415, 500],
    sampleCurl: `curl -X POST https://api.civicfix.city.gov/api/v1/issues/894/photos \\
  -H "Authorization: Bearer <jwt_access_token>" \\
  -F "file=@/path/to/pothole_evidence.jpg" \\
  -F "caption=Eroded asphalt crater"`
  },
  {
    id: 'citizen-get-my-issues',
    group: 'Citizen',
    name: 'Get My Issues',
    endpoint: '/api/v1/citizen/issues',
    method: 'GET',
    description: 'Retrieves a paginated list of all civic complaints submitted by the authenticated citizen with current status and SLA metrics.',
    authentication: 'Bearer JWT (Required)',
    requiredRole: 'CITIZEN',
    pathVariables: [],
    queryParams: [
      { name: 'page', type: 'integer', required: false, description: 'Page number (default 1)', default: '1' },
      { name: 'limit', type: 'integer', required: false, description: 'Items per page (max 50)', default: '10' },
      { name: 'status', type: 'string', required: false, description: 'Filter by lifecycle status' }
    ],
    requestBody: null,
    validationRules: [
      'page must be positive integer >= 1.',
      'limit must be between 1 and 50.'
    ],
    successStatus: 200,
    successResponse: {
      success: true,
      data: {
        items: [
          {
            id: 894,
            issueCode: 'CVX-2026-08142',
            title: 'Severe Water Main Rupture Flooding Intersection',
            categoryName: 'Water & Sewage',
            status: 'REPORTED',
            priority: 'HIGH',
            councilWard: 4,
            upvoteCount: 14,
            slaDeadline: '2026-09-12T06:45:00.000Z',
            isSlaBreached: false,
            createdAt: '2026-09-11T06:45:00.000Z'
          }
        ],
        pagination: {
          currentPage: 1,
          pageSize: 10,
          totalItems: 1,
          totalPages: 1
        }
      }
    },
    errorResponses: [
      {
        status: 401,
        title: 'Unauthorized',
        description: 'Missing or expired token.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/UNAUTHORIZED',
          title: 'Unauthorized',
          status: 401,
          detail: 'Authentication token missing.'
        }
      }
    ],
    httpStatusCodes: [200, 400, 401, 500],
    sampleCurl: `curl -X GET "https://api.civicfix.city.gov/api/v1/citizen/issues?page=1&limit=10" \\
  -H "Authorization: Bearer <jwt_access_token>"`
  },
  {
    id: 'citizen-get-issue-details',
    group: 'Citizen',
    name: 'Get Issue Details',
    endpoint: '/api/v1/issues/:id',
    method: 'GET',
    description: 'Retrieves comprehensive details of a specific issue including location, photos, assignments, and resolution proof.',
    authentication: 'Optional (JWT reveals internal notes)',
    requiredRole: 'Any (or Public)',
    pathVariables: [
      { name: 'id', type: 'integer', required: true, description: 'Unique Issue ID' }
    ],
    queryParams: [],
    requestBody: null,
    validationRules: [
      'id: Must be a positive integer.'
    ],
    successStatus: 200,
    successResponse: {
      success: true,
      data: {
        id: 894,
        issueCode: 'CVX-2026-08142',
        title: 'Severe Water Main Rupture Flooding Intersection',
        description: 'Continuous high-volume clean water surging through pavement fractures.',
        status: 'ASSIGNED',
        priority: 'HIGH',
        category: {
          id: 1,
          name: 'Water & Sewage',
          slaHours: 24
        },
        location: {
          address: '742 Evergreen Terrace, Sector 4',
          latitude: 37.7749,
          longitude: -122.4194,
          councilWard: 4
        },
        photos: [
          {
            id: 2048,
            photoUrl: 'https://storage.civicfix.city.gov/evidence/2026/09/cvx-894-photo-1.jpg',
            caption: 'Pavement collapse'
          }
        ],
        upvoteCount: 14,
        slaDeadline: '2026-09-12T06:45:00.000Z',
        createdAt: '2026-09-11T06:45:00.000Z'
      }
    },
    errorResponses: [
      {
        status: 404,
        title: 'Not Found',
        description: 'Issue not found.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/NOT_FOUND',
          title: 'Not Found',
          status: 404,
          detail: 'Issue with ID 894 not found.'
        }
      }
    ],
    httpStatusCodes: [200, 400, 404, 500],
    sampleCurl: `curl -X GET https://api.civicfix.city.gov/api/v1/issues/894`
  },
  {
    id: 'citizen-update-allowed-info',
    group: 'Citizen',
    name: 'Update Allowed Issue Information',
    endpoint: '/api/v1/citizen/issues/:id',
    method: 'PATCH',
    description: 'Allows the original citizen author to update safe descriptive fields (clarification text, landmark notes) while issue is in REPORTED or VERIFIED status.',
    authentication: 'Bearer JWT (Required)',
    requiredRole: 'CITIZEN (Author)',
    pathVariables: [
      { name: 'id', type: 'integer', required: true, description: 'Unique Issue ID' }
    ],
    queryParams: [],
    requestBody: {
      description: 'Continuous water surging. Roadway eroded. Water now crossing school driveway.',
      landmark: 'Beside Hydrant #B4, directly opposite school gates'
    },
    validationRules: [
      'Issue must be in REPORTED or VERIFIED status.',
      'Citizen cannot modify status, priority, category, or GPS coordinates.',
      'description: 20 to 2000 characters.',
      'landmark: max 200 characters.'
    ],
    successStatus: 200,
    successResponse: {
      success: true,
      message: 'Issue details updated successfully.',
      data: {
        id: 894,
        description: 'Continuous water surging. Roadway eroded. Water now crossing school driveway.',
        landmark: 'Beside Hydrant #B4, directly opposite school gates',
        updatedAt: '2026-09-11T07:30:00.000Z'
      }
    },
    errorResponses: [
      {
        status: 403,
        title: 'Forbidden',
        description: 'User is not the author of this issue.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/FORBIDDEN',
          title: 'Forbidden',
          status: 403,
          detail: 'You are not authorized to edit this grievance.'
        }
      },
      {
        status: 409,
        title: 'Conflict',
        description: 'Issue is already in progress or resolved.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/IMMUTABLE_STATE',
          title: 'Conflict',
          status: 409,
          detail: 'Issue has already progressed to IN_PROGRESS and can no longer be modified.'
        }
      }
    ],
    httpStatusCodes: [200, 400, 401, 403, 404, 409, 500],
    sampleCurl: `curl -X PATCH https://api.civicfix.city.gov/api/v1/citizen/issues/894 \\
  -H "Authorization: Bearer <jwt_access_token>" \\
  -H "Content-Type: application/json" \\
  -d '{"landmark":"Beside Hydrant #B4"}'`
  },
  {
    id: 'citizen-add-comment',
    group: 'Citizen',
    name: 'Add Comment',
    endpoint: '/api/v1/issues/:id/comments',
    method: 'POST',
    description: 'Appends a resident inquiry or community comment to an active civic complaint.',
    authentication: 'Bearer JWT (Required)',
    requiredRole: 'CITIZEN, FIELD_WORKER, DISPATCHER, SUPERVISOR, ADMIN',
    pathVariables: [
      { name: 'id', type: 'integer', required: true, description: 'Unique Issue ID' }
    ],
    queryParams: [],
    requestBody: {
      content: 'Water is now reaching the school driveway sidewalk. Kids are arriving for morning care.'
    },
    validationRules: [
      'id: Valid issue ID.',
      'content: Required string 3 to 1000 characters. Sanitized for profanity and spam.'
    ],
    successStatus: 201,
    successResponse: {
      success: true,
      message: 'Comment posted successfully.',
      data: {
        commentId: 512,
        issueId: 894,
        author: {
          id: 142,
          fullName: 'Maya Lin',
          role: 'CITIZEN'
        },
        content: 'Water is now reaching the school driveway sidewalk. Kids are arriving for morning care.',
        isInternalNote: false,
        createdAt: '2026-09-11T07:35:00.000Z'
      }
    },
    errorResponses: [
      {
        status: 400,
        title: 'Bad Request',
        description: 'Comment content is blank.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/BLANK_COMMENT',
          title: 'Bad Request',
          status: 400,
          detail: 'Comment content must be between 3 and 1000 characters.'
        }
      }
    ],
    httpStatusCodes: [201, 400, 401, 404, 422, 500],
    sampleCurl: `curl -X POST https://api.civicfix.city.gov/api/v1/issues/894/comments \\
  -H "Authorization: Bearer <jwt_access_token>" \\
  -H "Content-Type: application/json" \\
  -d '{"content":"Water is now reaching the school driveway sidewalk."}'`
  },
  {
    id: 'citizen-track-status',
    group: 'Citizen',
    name: 'Track Status by Code',
    endpoint: '/api/v1/issues/track/:issueCode',
    method: 'GET',
    description: 'Fast, unauthenticated public lookup endpoint allowing any citizen to enter ticket code (e.g. CVX-2026-08142) and track real-time municipal workflow and SLA countdown.',
    authentication: 'None (Public)',
    requiredRole: 'None',
    pathVariables: [
      { name: 'issueCode', type: 'string', required: true, description: 'Tracking code format: CVX-YYYY-XXXXX' }
    ],
    queryParams: [],
    requestBody: null,
    validationRules: [
      'issueCode: Must match regex ^CVX-\\d{4}-\\d{5}$'
    ],
    successStatus: 200,
    successResponse: {
      success: true,
      data: {
        issueCode: 'CVX-2026-08142',
        title: 'Severe Water Main Rupture Flooding Intersection',
        currentStatus: 'ASSIGNED',
        departmentAssigned: 'Department of Public Works - Water Distribution',
        slaCountdown: {
          deadline: '2026-09-12T06:45:00.000Z',
          hoursRemaining: 23.2,
          isBreached: false
        },
        timeline: [
          { status: 'REPORTED', timestamp: '2026-09-11T06:45:00.000Z', notes: 'Grievance registered' },
          { status: 'VERIFIED', timestamp: '2026-09-11T07:00:00.000Z', notes: 'Jurisdiction confirmed' },
          { status: 'ASSIGNED', timestamp: '2026-09-11T07:15:00.000Z', notes: 'Dispatched to Carlos Mendoza' }
        ]
      }
    },
    errorResponses: [
      {
        status: 404,
        title: 'Not Found',
        description: 'Tracking code not found.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/CODE_NOT_FOUND',
          title: 'Not Found',
          status: 404,
          detail: 'No civic issue found with tracking code CVX-2026-08142.'
        }
      }
    ],
    httpStatusCodes: [200, 400, 404, 500],
    sampleCurl: `curl -X GET https://api.civicfix.city.gov/api/v1/issues/track/CVX-2026-08142`
  },
  {
    id: 'citizen-receive-notifications',
    group: 'Citizen',
    name: 'Receive Notifications',
    endpoint: '/api/v1/notifications',
    method: 'GET',
    description: 'Retrieves all status alerts, dispatch notices, and resolution approvals addressed to the authenticated user.',
    authentication: 'Bearer JWT (Required)',
    requiredRole: 'Any Authenticated Role',
    pathVariables: [],
    queryParams: [
      { name: 'unreadOnly', type: 'boolean', required: false, description: 'Filter unread only (default false)' },
      { name: 'page', type: 'integer', required: false, description: 'Page number (default 1)' }
    ],
    requestBody: null,
    validationRules: [
      'unreadOnly must be boolean.',
      'page must be positive integer.'
    ],
    successStatus: 200,
    successResponse: {
      success: true,
      data: {
        items: [
          {
            id: 7891,
            title: 'Status Update: CVX-2026-08142',
            message: 'Your report Water Main Rupture has been assigned to Carlos Mendoza (DPW).',
            notificationType: 'STATUS_UPDATE',
            deliveryChannel: 'IN_APP',
            isRead: false,
            issueCode: 'CVX-2026-08142',
            createdAt: '2026-09-11T07:15:00.000Z'
          }
        ],
        unreadCount: 1
      }
    },
    errorResponses: [
      {
        status: 401,
        title: 'Unauthorized',
        description: 'Token missing.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/UNAUTHORIZED',
          title: 'Unauthorized',
          status: 401,
          detail: 'Bearer token missing or invalid.'
        }
      }
    ],
    httpStatusCodes: [200, 401, 500],
    sampleCurl: `curl -X GET https://api.civicfix.city.gov/api/v1/notifications \\
  -H "Authorization: Bearer <jwt_access_token>"`
  },

  // -------------------------------------------------------------
  // GROUP 3: PUBLIC
  // -------------------------------------------------------------
  {
    id: 'public-view-issues',
    group: 'Public',
    name: 'View Civic Issues Feed',
    endpoint: '/api/v1/public/issues',
    method: 'GET',
    description: 'Serves a sanitized public feed of civic grievances with upvote counts, category badges, council ward numbers, and resolution status.',
    authentication: 'None (Public)',
    requiredRole: 'None',
    pathVariables: [],
    queryParams: [
      { name: 'page', type: 'integer', required: false, description: 'Page number (default 1)' },
      { name: 'limit', type: 'integer', required: false, description: 'Limit items (default 15, max 50)' },
      { name: 'sortBy', type: 'string', required: false, description: 'latest | upvotes | urgent' }
    ],
    requestBody: null,
    validationRules: [
      'limit cannot exceed 50.'
    ],
    successStatus: 200,
    successResponse: {
      success: true,
      data: {
        items: [
          {
            id: 894,
            issueCode: 'CVX-2026-08142',
            title: 'Severe Water Main Rupture Flooding Intersection',
            categoryName: 'Water & Sewage',
            status: 'ASSIGNED',
            priority: 'HIGH',
            councilWard: 4,
            upvoteCount: 14,
            commentCount: 3,
            createdAt: '2026-09-11T06:45:00.000Z'
          }
        ],
        pagination: {
          currentPage: 1,
          pageSize: 15,
          totalItems: 184,
          totalPages: 13
        }
      }
    },
    errorResponses: [
      {
        status: 400,
        title: 'Bad Request',
        description: 'Invalid pagination.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/BAD_PAGINATION',
          title: 'Bad Request',
          status: 400,
          detail: 'Limit must be less than or equal to 50.'
        }
      }
    ],
    httpStatusCodes: [200, 400, 500],
    sampleCurl: `curl -X GET "https://api.civicfix.city.gov/api/v1/public/issues?page=1&limit=15"`
  },
  {
    id: 'public-view-map',
    group: 'Public',
    name: 'View Issue Map (GeoJSON)',
    endpoint: '/api/v1/public/issues/map',
    method: 'GET',
    description: 'Returns geospatial coordinates formatted as an OGC standard GeoJSON FeatureCollection for Leaflet / OpenStreetMap mapping.',
    authentication: 'None (Public)',
    requiredRole: 'None',
    pathVariables: [],
    queryParams: [
      { name: 'minLat', type: 'float', required: false, description: 'Minimum latitude bound' },
      { name: 'maxLat', type: 'float', required: false, description: 'Maximum latitude bound' },
      { name: 'minLng', type: 'float', required: false, description: 'Minimum longitude bound' },
      { name: 'maxLng', type: 'float', required: false, description: 'Maximum longitude bound' },
      { name: 'status', type: 'string', required: false, description: 'Filter by status' }
    ],
    requestBody: null,
    validationRules: [
      'Bounding box coordinates must be within valid range (-90..90, -180..180).'
    ],
    successStatus: 200,
    successResponse: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [-122.4194, 37.7749]
          },
          properties: {
            id: 894,
            issueCode: 'CVX-2026-08142',
            title: 'Water Main Rupture Flooding Intersection',
            status: 'ASSIGNED',
            priority: 'HIGH',
            category: 'Water & Sewage',
            councilWard: 4
          }
        }
      ]
    },
    errorResponses: [
      {
        status: 400,
        title: 'Bad Request',
        description: 'Malformed bounding box.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/INVALID_BBOX',
          title: 'Bad Request',
          status: 400,
          detail: 'minLat must be less than or equal to maxLat.'
        }
      }
    ],
    httpStatusCodes: [200, 400, 500],
    sampleCurl: `curl -X GET "https://api.civicfix.city.gov/api/v1/public/issues/map?minLat=37.70&maxLat=37.85&minLng=-122.50&maxLng=-122.35"`
  },
  {
    id: 'public-filter-issues',
    group: 'Public',
    name: 'Filter Issues',
    endpoint: '/api/v1/public/issues/filter',
    method: 'GET',
    description: 'Multi-faceted filtering endpoint allowing citizens to filter issues by status, category, priority, ward, and date range.',
    authentication: 'None (Public)',
    requiredRole: 'None',
    pathVariables: [],
    queryParams: [
      { name: 'status', type: 'string', required: false, description: 'REPORTED | VERIFIED | ASSIGNED | IN_PROGRESS | RESOLVED' },
      { name: 'categoryId', type: 'integer', required: false, description: 'Category primary key' },
      { name: 'councilWard', type: 'integer', required: false, description: 'Ward number (1-20)' },
      { name: 'priority', type: 'string', required: false, description: 'LOW | MEDIUM | HIGH | CRITICAL' },
      { name: 'hasResolutionProof', type: 'boolean', required: false, description: 'Has post-repair proof' }
    ],
    requestBody: null,
    validationRules: [
      'councilWard must be between 1 and 20.',
      'priority must match valid enum.'
    ],
    successStatus: 200,
    successResponse: {
      success: true,
      filtersApplied: {
        status: 'RESOLVED',
        councilWard: 4
      },
      data: {
        items: [
          {
            id: 810,
            issueCode: 'CVX-2026-07921',
            title: 'Low Pressure Water Line Leak',
            status: 'RESOLVED',
            priority: 'MEDIUM',
            councilWard: 4,
            resolutionTimeHours: 18.5
          }
        ],
        pagination: { currentPage: 1, pageSize: 15, totalItems: 1 }
      }
    },
    errorResponses: [
      {
        status: 400,
        title: 'Bad Request',
        description: 'Invalid filter value.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/INVALID_FILTER',
          title: 'Bad Request',
          status: 400,
          detail: 'Status value UNKNOWN is not supported.'
        }
      }
    ],
    httpStatusCodes: [200, 400, 500],
    sampleCurl: `curl -X GET "https://api.civicfix.city.gov/api/v1/public/issues/filter?status=RESOLVED&councilWard=4"`
  },
  {
    id: 'public-search-issues',
    group: 'Public',
    name: 'Search Issues',
    endpoint: '/api/v1/public/issues/search',
    method: 'GET',
    description: 'Full-text and phonetic search across complaint titles, descriptions, street addresses, and landmarks.',
    authentication: 'None (Public)',
    requiredRole: 'None',
    pathVariables: [],
    queryParams: [
      { name: 'q', type: 'string', required: true, description: 'Search keywords (min 2 characters)' },
      { name: 'page', type: 'integer', required: false, description: 'Page number (default 1)' }
    ],
    requestBody: null,
    validationRules: [
      'q: Required string min 2 characters, max 100 characters.'
    ],
    successStatus: 200,
    successResponse: {
      success: true,
      query: 'water main evergreen',
      data: {
        items: [
          {
            id: 894,
            issueCode: 'CVX-2026-08142',
            title: 'Severe Water Main Rupture Flooding Intersection',
            address: '742 Evergreen Terrace, Sector 4',
            status: 'ASSIGNED',
            relevanceScore: 0.94
          }
        ],
        pagination: { currentPage: 1, pageSize: 10, totalItems: 1 }
      }
    },
    errorResponses: [
      {
        status: 400,
        title: 'Bad Request',
        description: 'Search query parameter missing.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/MISSING_QUERY',
          title: 'Bad Request',
          status: 400,
          detail: 'Search parameter q is required and must contain at least 2 characters.'
        }
      }
    ],
    httpStatusCodes: [200, 400, 500],
    sampleCurl: `curl -X GET "https://api.civicfix.city.gov/api/v1/public/issues/search?q=water%20main%20evergreen"`
  },

  // -------------------------------------------------------------
  // GROUP 4: ADMIN
  // -------------------------------------------------------------
  {
    id: 'admin-get-all-issues',
    group: 'Admin',
    name: 'Get All Issues (Master Grid)',
    endpoint: '/api/v1/admin/issues',
    method: 'GET',
    description: 'Administrative master grid endpoint returning issues with internal dispatch logs, SLA breach warnings, assigned worker telemetry, and costs.',
    authentication: 'Bearer JWT (Required)',
    requiredRole: 'DISPATCHER, SUPERVISOR, ADMIN',
    pathVariables: [],
    queryParams: [
      { name: 'page', type: 'integer', required: false, description: 'Page number (default 1)' },
      { name: 'limit', type: 'integer', required: false, description: 'Items per page (default 25, max 100)' },
      { name: 'status', type: 'string', required: false, description: 'Filter by status' },
      { name: 'department', type: 'string', required: false, description: 'Target department' },
      { name: 'slaBreachedOnly', type: 'boolean', required: false, description: 'Filter SLA violations' }
    ],
    requestBody: null,
    validationRules: [
      'User role must be DISPATCHER, SUPERVISOR, or ADMIN.'
    ],
    successStatus: 200,
    successResponse: {
      success: true,
      data: {
        items: [
          {
            id: 894,
            issueCode: 'CVX-2026-08142',
            title: 'Severe Water Main Rupture Flooding Intersection',
            categoryName: 'Water & Sewage',
            targetDepartment: 'Department of Public Works - Water Distribution',
            status: 'ASSIGNED',
            priority: 'HIGH',
            reporter: {
              id: 142,
              fullName: 'Maya Lin',
              phone: '+1-555-019-2834'
            },
            assignedTo: {
              workerId: 32,
              workerName: 'Carlos Mendoza',
              badge: 'DPW-TECH-882'
            },
            councilWard: 4,
            slaDeadline: '2026-09-12T06:45:00.000Z',
            isSlaBreached: false,
            createdAt: '2026-09-11T06:45:00.000Z'
          }
        ],
        metrics: {
          totalOpen: 47,
          slaBreachedCount: 3,
          unassignedCount: 8
        },
        pagination: { currentPage: 1, pageSize: 25, totalItems: 47 }
      }
    },
    errorResponses: [
      {
        status: 403,
        title: 'Forbidden',
        description: 'Insufficient privileges.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/FORBIDDEN',
          title: 'Forbidden',
          status: 403,
          detail: 'Citizen users are not authorized to view the administrative issues master grid.'
        }
      }
    ],
    httpStatusCodes: [200, 401, 403, 500],
    sampleCurl: `curl -X GET https://api.civicfix.city.gov/api/v1/admin/issues \\
  -H "Authorization: Bearer <staff_jwt_token>"`
  },
  {
    id: 'admin-verify-issue',
    group: 'Admin',
    name: 'Verify Issue',
    endpoint: '/api/v1/admin/issues/:id/verify',
    method: 'PATCH',
    description: 'Supervisor or Dispatcher verification gate confirming grievance is legitimate, within jurisdiction, and non-duplicate. Transitions state from REPORTED to VERIFIED.',
    authentication: 'Bearer JWT (Required)',
    requiredRole: 'DISPATCHER, SUPERVISOR, ADMIN',
    pathVariables: [
      { name: 'id', type: 'integer', required: true, description: 'Unique Issue ID' }
    ],
    queryParams: [],
    requestBody: {
      verificationNotes: 'Confirmed municipal water main pipe #WM-404. Flow presents immediate hazard.',
      adjustedPriority: 'HIGH'
    },
    validationRules: [
      'Issue must currently be in REPORTED status.',
      'verificationNotes: Required string 5 to 500 characters.',
      'adjustedPriority: Optional enum (LOW, MEDIUM, HIGH, CRITICAL).'
    ],
    successStatus: 200,
    successResponse: {
      success: true,
      message: 'Issue verified and approved for work dispatch.',
      data: {
        id: 894,
        issueCode: 'CVX-2026-08142',
        status: 'VERIFIED',
        priority: 'HIGH',
        verifiedBy: {
          userId: 5,
          name: 'Marcus Vance',
          role: 'DISPATCHER'
        },
        verifiedAt: '2026-09-11T07:00:00.000Z'
      }
    },
    errorResponses: [
      {
        status: 409,
        title: 'Conflict',
        description: 'Issue is not in REPORTED status.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/INVALID_TRANSITION',
          title: 'Conflict',
          status: 409,
          detail: 'Only issues in REPORTED state can be verified.'
        }
      }
    ],
    httpStatusCodes: [200, 400, 401, 403, 404, 409, 500],
    sampleCurl: `curl -X PATCH https://api.civicfix.city.gov/api/v1/admin/issues/894/verify \\
  -H "Authorization: Bearer <staff_jwt_token>" \\
  -H "Content-Type: application/json" \\
  -d '{"verificationNotes":"Confirmed municipal water main pipe #WM-404.","adjustedPriority":"HIGH"}'`
  },
  {
    id: 'admin-assign-issue',
    group: 'Admin',
    name: 'Assign Issue to Field Worker',
    endpoint: '/api/v1/admin/issues/:id/assign',
    method: 'POST',
    description: 'Issues an official municipal work order dispatching a specific field technician or contracted crew to the site.',
    authentication: 'Bearer JWT (Required)',
    requiredRole: 'DISPATCHER, ADMIN',
    pathVariables: [
      { name: 'id', type: 'integer', required: true, description: 'Unique Issue ID' }
    ],
    queryParams: [],
    requestBody: {
      assignedToUserId: 32,
      departmentName: 'Department of Public Works - Water Distribution',
      instructions: 'Locate curb stop valve #SV-12. Isolate 8-inch main section and deploy vacuum hydro-excavator.',
      deadlineHours: 24
    },
    validationRules: [
      'Issue must be in VERIFIED or REPORTED status.',
      'assignedToUserId: Required positive integer referencing active FIELD_WORKER.',
      'departmentName: Required string 3 to 100 characters.',
      'instructions: Required string 10 to 1000 characters.',
      'deadlineHours: Required integer 1 to 168 (max 7 days).'
    ],
    successStatus: 201,
    successResponse: {
      success: true,
      message: 'Work order dispatched successfully. Field crew notified.',
      data: {
        assignmentId: 412,
        issueId: 894,
        issueCode: 'CVX-2026-08142',
        assignedWorker: {
          id: 32,
          fullName: 'Carlos Mendoza',
          badgeNumber: 'DPW-TECH-882'
        },
        deadline: '2026-09-12T07:15:00.000Z',
        assignmentStatus: 'ASSIGNED',
        dispatchedAt: '2026-09-11T07:15:00.000Z'
      }
    },
    errorResponses: [
      {
        status: 404,
        title: 'Not Found',
        description: 'Field worker user not found.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/WORKER_NOT_FOUND',
          title: 'Not Found',
          status: 404,
          detail: 'No active FIELD_WORKER found with ID 32.'
        }
      }
    ],
    httpStatusCodes: [201, 400, 401, 403, 404, 409, 500],
    sampleCurl: `curl -X POST https://api.civicfix.city.gov/api/v1/admin/issues/894/assign \\
  -H "Authorization: Bearer <dispatcher_jwt>" \\
  -H "Content-Type: application/json" \\
  -d '{"assignedToUserId":32,"departmentName":"DPW","instructions":"Isolate line","deadlineHours":24}'`
  },
  {
    id: 'admin-update-status',
    group: 'Admin',
    name: 'Update Lifecycle Status',
    endpoint: '/api/v1/admin/issues/:id/status',
    method: 'PATCH',
    description: 'Advances issue state (REPORTED -> VERIFIED -> ASSIGNED -> IN_PROGRESS -> RESOLVED -> CLOSED) and appends an immutable audit record to issue_status_history.',
    authentication: 'Bearer JWT (Required)',
    requiredRole: 'DISPATCHER, SUPERVISOR, FIELD_WORKER, ADMIN',
    pathVariables: [
      { name: 'id', type: 'integer', required: true, description: 'Unique Issue ID' }
    ],
    queryParams: [],
    requestBody: {
      status: 'IN_PROGRESS',
      reasonOrNotes: 'Crew on site with hydro-excavation truck. Isolating line pressure.',
      changeTrigger: 'FIELD_CREW_CHECKIN'
    },
    validationRules: [
      'status: Required enum (VERIFIED, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED).',
      'Direct transition to RESOLVED requires pre-existing resolution_proof record.',
      'reasonOrNotes: Required string 5 to 500 characters.',
      'changeTrigger: Required enum (DISPATCHER_ACTION, FIELD_CREW_CHECKIN, FIELD_RESOLUTION, SUPERVISOR_AUDIT).'
    ],
    successStatus: 200,
    successResponse: {
      success: true,
      message: 'Issue status updated successfully.',
      data: {
        issueId: 894,
        issueCode: 'CVX-2026-08142',
        previousStatus: 'ASSIGNED',
        newStatus: 'IN_PROGRESS',
        changedBy: {
          userId: 32,
          name: 'Carlos Mendoza',
          role: 'FIELD_WORKER'
        },
        updatedAt: '2026-09-11T08:10:00.000Z'
      }
    },
    errorResponses: [
      {
        status: 409,
        title: 'Conflict',
        description: 'Illegal status transition without resolution proof.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/MISSING_PROOF',
          title: 'Conflict',
          status: 409,
          detail: 'Cannot transition issue to RESOLVED without submitting resolution proof first.'
        }
      }
    ],
    httpStatusCodes: [200, 400, 401, 403, 404, 409, 500],
    sampleCurl: `curl -X PATCH https://api.civicfix.city.gov/api/v1/admin/issues/894/status \\
  -H "Authorization: Bearer <staff_jwt>" \\
  -H "Content-Type: application/json" \\
  -d '{"status":"IN_PROGRESS","reasonOrNotes":"Crew on site","changeTrigger":"FIELD_CREW_CHECKIN"}'`
  },
  {
    id: 'admin-reject-issue',
    group: 'Admin',
    name: 'Reject Issue',
    endpoint: '/api/v1/admin/issues/:id/reject',
    method: 'PATCH',
    description: 'Formally rejects an out-of-jurisdiction, duplicate, or private property grievance, transitioning status to REJECTED and notifying citizen with mandatory administrative rationale.',
    authentication: 'Bearer JWT (Required)',
    requiredRole: 'SUPERVISOR, ADMIN',
    pathVariables: [
      { name: 'id', type: 'integer', required: true, description: 'Unique Issue ID' }
    ],
    queryParams: [],
    requestBody: {
      rejectionReason: 'PRIVATE_PROPERTY',
      explanation: 'Inspection determined the water leak originated within private residential plumbing behind the water meter, outside municipal maintenance jurisdiction.'
    },
    validationRules: [
      'Issue must be in REPORTED or VERIFIED status.',
      'rejectionReason: Required enum (DUPLICATE, OUT_OF_JURISDICTION, PRIVATE_PROPERTY, INSUFFICIENT_EVIDENCE, SPAM).',
      'explanation: Required string 15 to 1000 characters.'
    ],
    successStatus: 200,
    successResponse: {
      success: true,
      message: 'Grievance rejected. Notification sent to reporter.',
      data: {
        issueId: 894,
        issueCode: 'CVX-2026-08142',
        status: 'REJECTED',
        rejectionReason: 'PRIVATE_PROPERTY',
        explanation: 'Inspection determined the water leak originated within private residential plumbing behind the water meter.',
        rejectedBy: {
          userId: 2,
          name: 'Sarah Jenkins',
          role: 'SUPERVISOR'
        },
        rejectedAt: '2026-09-11T08:30:00.000Z'
      }
    },
    errorResponses: [
      {
        status: 400,
        title: 'Bad Request',
        description: 'Explanation under 15 characters.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/SHORT_EXPLANATION',
          title: 'Bad Request',
          status: 400,
          detail: 'Rejection explanation must be at least 15 characters long.'
        }
      }
    ],
    httpStatusCodes: [200, 400, 401, 403, 404, 409, 500],
    sampleCurl: `curl -X PATCH https://api.civicfix.city.gov/api/v1/admin/issues/894/reject \\
  -H "Authorization: Bearer <supervisor_jwt>" \\
  -H "Content-Type: application/json" \\
  -d '{"rejectionReason":"PRIVATE_PROPERTY","explanation":"Inspection determined leak is private plumbing."}'`
  },
  {
    id: 'admin-add-official-comment',
    group: 'Admin',
    name: 'Add Official Comment / Internal Note',
    endpoint: '/api/v1/admin/issues/:id/official-comments',
    method: 'POST',
    description: 'Posts a certified official municipal update (visible to public) or a confidential operational note (hidden from citizen via isInternalNote: true).',
    authentication: 'Bearer JWT (Required)',
    requiredRole: 'DISPATCHER, SUPERVISOR, FIELD_WORKER, ADMIN',
    pathVariables: [
      { name: 'id', type: 'integer', required: true, description: 'Unique Issue ID' }
    ],
    queryParams: [],
    requestBody: {
      content: 'Excavation revealed rupture on 8-inch cast iron pipe from 1954. Replacement sleeve clamped; asphalt crew scheduled for 2:00 PM.',
      isInternalNote: false
    },
    validationRules: [
      'content: Required string 5 to 2000 characters.',
      'isInternalNote: Required boolean.'
    ],
    successStatus: 201,
    successResponse: {
      success: true,
      message: 'Official comment recorded.',
      data: {
        commentId: 732,
        issueId: 894,
        author: {
          userId: 32,
          fullName: 'Carlos Mendoza',
          role: 'FIELD_WORKER'
        },
        content: 'Excavation revealed rupture on 8-inch cast iron pipe from 1954.',
        isInternalNote: false,
        createdAt: '2026-09-11T13:45:00.000Z'
      }
    },
    errorResponses: [
      {
        status: 403,
        title: 'Forbidden',
        description: 'Citizens cannot post official comments.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/FORBIDDEN',
          title: 'Forbidden',
          status: 403,
          detail: 'Only authorized municipal staff can post official comments.'
        }
      }
    ],
    httpStatusCodes: [201, 400, 401, 403, 404, 500],
    sampleCurl: `curl -X POST https://api.civicfix.city.gov/api/v1/admin/issues/894/official-comments \\
  -H "Authorization: Bearer <staff_jwt>" \\
  -H "Content-Type: application/json" \\
  -d '{"content":"Excavation completed.","isInternalNote":false}'`
  },
  {
    id: 'admin-upload-resolution-proof',
    group: 'Admin',
    name: 'Upload Resolution Proof',
    endpoint: '/api/v1/admin/issues/:id/resolution-proof',
    method: 'POST',
    description: 'Submits the post-repair evidence dossier: After photograph URL, itemized labor hours, materials cost, and work description. Automatically marks issue as RESOLVED.',
    authentication: 'Bearer JWT (Required)',
    requiredRole: 'FIELD_WORKER, SUPERVISOR, ADMIN',
    pathVariables: [
      { name: 'id', type: 'integer', required: true, description: 'Unique Issue ID' }
    ],
    queryParams: [],
    requestBody: {
      afterPhotoUrl: 'https://storage.civicfix.city.gov/evidence/2026/09/cvx-894-resolved.jpg',
      workDescription: 'Replaced ruptured 8-inch cast-iron section with ductile iron sleeve, backfilled with gravel aggregate, compacted, and laid hot asphalt patch.',
      laborHours: 4.5,
      materialsCost: 680.50
    },
    validationRules: [
      'Issue must currently be in IN_PROGRESS or ASSIGNED status.',
      'afterPhotoUrl: Required valid URL.',
      'workDescription: Required string 10 to 1000 characters.',
      'laborHours: Required float > 0.0 and <= 200.0.',
      'materialsCost: Required float >= 0.00.'
    ],
    successStatus: 201,
    successResponse: {
      success: true,
      message: 'Resolution proof logged successfully. Issue marked as RESOLVED.',
      data: {
        proofId: 98,
        issueId: 894,
        issueCode: 'CVX-2026-08142',
        status: 'RESOLVED',
        afterPhotoUrl: 'https://storage.civicfix.city.gov/evidence/2026/09/cvx-894-resolved.jpg',
        laborHours: 4.5,
        materialsCost: 680.50,
        verificationStatus: 'PENDING_REVIEW',
        resolvedBy: {
          userId: 32,
          name: 'Carlos Mendoza',
          badge: 'DPW-TECH-882'
        },
        completedAt: '2026-09-11T16:30:00.000Z'
      }
    },
    errorResponses: [
      {
        status: 409,
        title: 'Conflict',
        description: 'Resolution proof already exists.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/PROOF_EXISTS',
          title: 'Conflict',
          status: 409,
          detail: 'Resolution proof has already been submitted for this issue.'
        }
      }
    ],
    httpStatusCodes: [201, 400, 401, 403, 404, 409, 500],
    sampleCurl: `curl -X POST https://api.civicfix.city.gov/api/v1/admin/issues/894/resolution-proof \\
  -H "Authorization: Bearer <worker_jwt>" \\
  -H "Content-Type: application/json" \\
  -d '{"afterPhotoUrl":"https://storage...","workDescription":"Replaced pipe","laborHours":4.5,"materialsCost":680.5}'`
  },
  {
    id: 'admin-dashboard-stats',
    group: 'Admin',
    name: 'View Dashboard Statistics',
    endpoint: '/api/v1/admin/dashboard/statistics',
    method: 'GET',
    description: 'Computes real-time municipal operational telemetry: total volume, resolution rate (%), average time-to-repair (hours), SLA compliance, category and ward distributions, and cost expenditure.',
    authentication: 'Bearer JWT (Required)',
    requiredRole: 'SUPERVISOR, ADMIN',
    pathVariables: [],
    queryParams: [
      { name: 'timeframe', type: 'string', required: false, description: '7d | 30d | 90d | year (default 30d)' },
      { name: 'councilWard', type: 'integer', required: false, description: 'Filter by ward number' },
      { name: 'department', type: 'string', required: false, description: 'Filter by department name' }
    ],
    requestBody: null,
    validationRules: [
      'timeframe: Must be one of 7d, 30d, 90d, year.'
    ],
    successStatus: 200,
    successResponse: {
      success: true,
      timeframe: '30d',
      data: {
        summary: {
          totalIssues: 342,
          resolvedIssues: 298,
          inProgressIssues: 28,
          openUnassigned: 16,
          resolutionRatePercentage: 87.13,
          averageResolutionHours: 19.4,
          slaCompliancePercentage: 94.2,
          totalMaterialsExpended: 48250.75
        },
        breakdownByCategory: [
          { categoryCode: 'ROADS_POTHOLES', count: 142, resolvedCount: 130, avgHours: 16.2 },
          { categoryCode: 'WATER_SEWER', count: 94, resolvedCount: 85, avgHours: 14.8 },
          { categoryCode: 'STREET_LIGHTING', count: 68, resolvedCount: 58, avgHours: 26.5 }
        ],
        breakdownByWard: [
          { wardNumber: 1, issuesCount: 42, resolvedPercentage: 90.5 },
          { wardNumber: 4, issuesCount: 92, resolvedPercentage: 89.1 }
        ]
      }
    },
    errorResponses: [
      {
        status: 403,
        title: 'Forbidden',
        description: 'Only Supervisors and Admins can access analytics.',
        sample: {
          type: 'https://api.civicfix.city.gov/errors/FORBIDDEN',
          title: 'Forbidden',
          status: 403,
          detail: 'Dashboard telemetry is restricted to SUPERVISOR and ADMIN roles.'
        }
      }
    ],
    httpStatusCodes: [200, 400, 401, 403, 500],
    sampleCurl: `curl -X GET "https://api.civicfix.city.gov/api/v1/admin/dashboard/statistics?timeframe=30d" \\
  -H "Authorization: Bearer <supervisor_jwt>"`
  }
];
