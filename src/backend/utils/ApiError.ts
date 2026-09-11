/**
 * RFC 7807 Compliant ApiError Class
 */

export class ApiError extends Error {
  public readonly status: number;
  public readonly type: string;
  public readonly title: string;
  public readonly detail: string;
  public readonly instance?: string;
  public readonly invalidParams?: { name: string; reason: string }[];

  constructor(
    status: number,
    title: string,
    detail: string,
    type: string = 'about:blank',
    invalidParams?: { name: string; reason: string }[]
  ) {
    super(detail);
    this.name = 'ApiError';
    this.status = status;
    this.title = title;
    this.detail = detail;
    this.type = type.startsWith('http') ? type : `https://api.civicfix.city.gov/errors/${type}`;
    this.invalidParams = invalidParams;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(detail: string, type: string = 'BAD_REQUEST', invalidParams?: { name: string; reason: string }[]) {
    return new ApiError(400, 'Bad Request', detail, type, invalidParams);
  }

  static unauthorized(detail: string = 'Authentication required or invalid token', type: string = 'UNAUTHORIZED') {
    return new ApiError(401, 'Unauthorized', detail, type);
  }

  static forbidden(detail: string = 'Insufficient municipal authority', type: string = 'FORBIDDEN') {
    return new ApiError(403, 'Forbidden', detail, type);
  }

  static notFound(detail: string = 'Resource not found', type: string = 'NOT_FOUND') {
    return new ApiError(404, 'Not Found', detail, type);
  }

  static conflict(detail: string, type: string = 'CONFLICT') {
    return new ApiError(409, 'Conflict', detail, type);
  }

  static unprocessable(detail: string, invalidParams?: { name: string; reason: string }[]) {
    return new ApiError(422, 'Unprocessable Entity', detail, 'VALIDATION_FAILED', invalidParams);
  }

  toProblemDetails(instancePath?: string) {
    return {
      type: this.type,
      title: this.title,
      status: this.status,
      detail: this.detail,
      instance: instancePath || this.instance || '/api/v1',
      ...(this.invalidParams ? { invalidParams: this.invalidParams } : {})
    };
  }
}
