import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Performance monitoring middleware
 * Tracks request duration and logs slow requests
 */
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    // Add performance header
    res.setHeader('X-Response-Time', `${duration}ms`);

    // Log slow requests (> 1 second)
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        statusCode: res.statusCode,
      });
    }

    // Log all requests in development
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Request completed', {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        statusCode: res.statusCode,
      });
    }
  });

  next();
};

/**
 * Cache control middleware
 * Sets appropriate cache headers for different endpoints
 */
export const cacheControl = (maxAge: number = 0, isPublic: boolean = false) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (maxAge === 0) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else {
      const visibility = isPublic ? 'public' : 'private';
      res.setHeader('Cache-Control', `${visibility}, max-age=${maxAge}`);
    }
    next();
  };
};

/**
 * ETag generator middleware
 * Generates ETags for responses to enable conditional requests
 */
export const etagGenerator = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;

  res.send = function (data: any): Response {
    // Only generate ETag for GET requests
    if (req.method === 'GET' && data) {
      const etag = generateETag(data);
      res.setHeader('ETag', etag);

      // Check if client has matching ETag
      const clientETag = req.headers['if-none-match'];
      if (clientETag === etag) {
        res.status(304);
        return originalSend.call(this, '');
      }
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Generate ETag from response data
 */
function generateETag(data: any): string {
  const crypto = require('crypto');
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  return `"${crypto.createHash('md5').update(content).digest('hex')}"`;
}

/**
 * Pagination helper middleware
 * Adds pagination metadata to responses
 */
export const paginationMetadata = (req: Request, res: Response, next: NextFunction) => {
  // Store original json method
  const originalJson = res.json;

  // Override json method
  res.json = function (data: any): Response {
    // Check if this is a paginated response
    if (data && data.data && Array.isArray(data.data)) {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const total = data.total || data.data.length;

      // Add pagination metadata
      data.pagination = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrevious: page > 1,
      };
    }

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Request size limiter
 * Prevents large payloads from consuming too much memory
 */
export const requestSizeLimiter = (maxSize: string = '10mb') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = req.headers['content-length'];

    if (contentLength) {
      const sizeInMB = parseInt(contentLength) / (1024 * 1024);
      const maxSizeInMB = parseInt(maxSize);

      if (sizeInMB > maxSizeInMB) {
        return res.status(413).json({
          success: false,
          error: {
            message: `Request payload too large. Maximum size is ${maxSize}`,
            code: 'PAYLOAD_TOO_LARGE',
          },
        });
      }
    }

    next();
  };
};

/**
 * Response compression hints
 * Adds headers to indicate compression support
 */
export const compressionHints = (req: Request, res: Response, next: NextFunction) => {
  // Add vary header for compression
  res.setHeader('Vary', 'Accept-Encoding');

  // Set content type hints for better compression
  const originalJson = res.json;
  res.json = function (data: any): Response {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return originalJson.call(this, data);
  };

  next();
};

/**
 * API response time target header
 * Helps clients understand expected response times
 */
export const responseTimeTarget = (targetMs: number = 500) => {
  return (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Response-Time-Target', `${targetMs}ms`);
    next();
  };
};

/**
 * Lazy loading helper
 * Defers loading of non-critical data
 */
export const lazyLoadHelper = (req: Request, res: Response, next: NextFunction) => {
  // Add helper function to response
  (res as any).lazyLoad = (dataLoader: () => Promise<any>, key: string = 'lazyData') => {
    return {
      [key]: null,
      [`${key}Url`]: `${req.baseUrl}${req.path}/lazy/${key}`,
    };
  };

  next();
};

/**
 * Bundle multiple middleware for performance optimization
 */
export const performanceMiddleware = [
  performanceMonitor,
  compressionHints,
  responseTimeTarget(500),
];

export default {
  performanceMonitor,
  cacheControl,
  etagGenerator,
  paginationMetadata,
  requestSizeLimiter,
  compressionHints,
  responseTimeTarget,
  lazyLoadHelper,
  performanceMiddleware,
};
