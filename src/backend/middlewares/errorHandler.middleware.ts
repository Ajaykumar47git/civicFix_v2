/**
 * RFC 7807 Problem Details Error Handler Middleware
 */
import { ApiError } from '../utils/ApiError';

export function handleException(err: any, reqPath: string = '/api/v1') {
  if (err instanceof ApiError) {
    return {
      status: err.status,
      body: err.toProblemDetails(reqPath)
    };
  }

  // Fallback to internal server error 500
  const internal = new ApiError(
    500,
    'Internal Server Error',
    err?.message || 'An unexpected exception occurred on the municipal backend service.',
    'INTERNAL_SERVER_ERROR'
  );

  return {
    status: 500,
    body: internal.toProblemDetails(reqPath)
  };
}
