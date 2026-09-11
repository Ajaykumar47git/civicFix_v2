/**
 * OpenAPI 3.1 Swagger Specification for CivicFix Auth & Issue Modules
 */

export const civicFixSwaggerSpec = {
  openapi: '3.1.0',
  info: {
    title: 'CivicFix Municipal Platform API',
    version: '1.0.0',
    description: 'REST API specification for CivicFix municipal issue reporting, field dispatch, and authentication.'
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Primary Municipal API Gateway'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Standard RS256 / HS256 signed municipal access token.'
      }
    },
    schemas: {
      ProblemDetails: {
        type: 'object',
        properties: {
          type: { type: 'string', example: 'https://api.civicfix.city.gov/errors/UNAUTHORIZED' },
          title: { type: 'string', example: 'Unauthorized' },
          status: { type: 'integer', example: 401 },
          detail: { type: 'string', example: 'Invalid email or password credentials.' },
          instance: { type: 'string', example: '/api/v1/auth/login' }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'usr-cit-01' },
          email: { type: 'string', example: 'elena@gmail.com' },
          fullName: { type: 'string', example: 'Elena Rostova' },
          wardId: { type: 'integer', example: 4 },
          role: { type: 'string', enum: ['CITIZEN', 'FIELD_WORKER', 'DISPATCHER', 'SUPERVISOR', 'ADMIN'] },
          isVerified: { type: 'boolean', example: true }
        }
      },
      Issue: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'iss-8941' },
          issueCode: { type: 'string', example: 'CVX-2026-08142' },
          title: { type: 'string', example: 'Water Main Rupture Flooding Intersection' },
          description: { type: 'string', example: 'Large volume of pressurized water erupting from subterranean main.' },
          categoryId: { type: 'integer', example: 2 },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'] },
          status: { type: 'string', enum: ['REPORTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'] },
          latitude: { type: 'number', example: 37.7749 },
          longitude: { type: 'number', example: -122.4194 },
          address: { type: 'string', example: '742 Evergreen Terrace, Sector 4' },
          slaDeadline: { type: 'string', format: 'date-time' }
        }
      }
    }
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register new citizen account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'fullName', 'wardId'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  fullName: { type: 'string', minLength: 2 },
                  phone: { type: 'string' },
                  wardId: { type: 'integer', minimum: 1, maximum: 20 }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Citizen account registered successfully' },
          '400': { description: 'Validation failed' },
          '409': { description: 'Email already registered' }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Authenticate and receive JWT token pair',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Authentication successful with JWT Bearer' },
          '401': { description: 'Invalid email or password' }
        }
      }
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get active session profile',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Active user profile details' },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/citizen/issues': {
      post: {
        tags: ['Citizen Issues'],
        summary: 'Create new municipal issue grievance',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['categoryId', 'title', 'description', 'latitude', 'longitude', 'address'],
                properties: {
                  categoryId: { type: 'integer' },
                  title: { type: 'string', minLength: 10, maxLength: 150 },
                  description: { type: 'string', minLength: 20, maxLength: 2000 },
                  latitude: { type: 'number' },
                  longitude: { type: 'number' },
                  address: { type: 'string' },
                  landmark: { type: 'string' },
                  priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'] },
                  photoUrls: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Issue created with assigned CVX tracking code' },
          '400': { description: 'Invalid input or out of municipal bounds' },
          '401': { description: 'Unauthorized' }
        }
      },
      get: {
        tags: ['Citizen Issues'],
        summary: 'List issues reported by authenticated citizen',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } }
        ],
        responses: {
          '200': { description: 'Paginated list of citizen grievances' }
        }
      }
    }
  }
};
