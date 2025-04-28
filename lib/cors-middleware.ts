import { NextApiRequest, NextApiResponse } from 'next';

interface CorsOptions {
  origin?: string | string[] | boolean;
  methods?: string | string[];
  allowedHeaders?: string | string[];
  exposedHeaders?: string | string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * Custom CORS middleware implementation without external dependencies
 */
export function corsMiddleware(options: CorsOptions = {}) {
  console.log('CUSTOM CORS: Creating middleware with options:', options);
  
  // Set default options
  const defaultOptions: CorsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,X-Requested-With',
    credentials: false
  };
  
  // Merge with user options
  const corsOptions: CorsOptions = {
    ...defaultOptions,
    ...options
  };
  
  console.log('CUSTOM CORS: Final middleware options:', corsOptions);
  
  return function(req: NextApiRequest, res: NextApiResponse, next: (result?: any) => void) {
    console.log('CUSTOM CORS: Middleware function invoked');
    console.log('CUSTOM CORS: Request method:', req.method);
    console.log('CUSTOM CORS: Origin header:', req.headers.origin);
    
    try {
      // Handle origin
      const requestOrigin = req.headers.origin || '';
      let allowOrigin = '*';
      
      if (corsOptions.origin === true) {
        // Allow the request origin
        allowOrigin = requestOrigin;
      } else if (typeof corsOptions.origin === 'string') {
        // Use the specified origin
        allowOrigin = corsOptions.origin;
      } else if (Array.isArray(corsOptions.origin) && corsOptions.origin.includes(requestOrigin)) {
        // Check if the request origin is in the allowed list
        allowOrigin = requestOrigin;
      }
      
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', allowOrigin);
      
      // Handle methods
      if (corsOptions.methods) {
        const methods = Array.isArray(corsOptions.methods)
          ? corsOptions.methods.join(',')
          : corsOptions.methods;
        res.setHeader('Access-Control-Allow-Methods', methods);
      }
      
      // Handle headers
      if (corsOptions.allowedHeaders) {
        const headers = Array.isArray(corsOptions.allowedHeaders)
          ? corsOptions.allowedHeaders.join(',')
          : corsOptions.allowedHeaders;
        res.setHeader('Access-Control-Allow-Headers', headers);
      }
      
      // Handle credentials
      if (corsOptions.credentials) {
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      
      // Handle max age
      if (corsOptions.maxAge) {
        res.setHeader('Access-Control-Max-Age', corsOptions.maxAge.toString());
      }
      
      // Handle exposed headers
      if (corsOptions.exposedHeaders) {
        const headers = Array.isArray(corsOptions.exposedHeaders)
          ? corsOptions.exposedHeaders.join(',')
          : corsOptions.exposedHeaders;
        res.setHeader('Access-Control-Expose-Headers', headers);
      }
      
      console.log('CUSTOM CORS: CORS headers set:', {
        'Access-Control-Allow-Origin': res.getHeader('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': res.getHeader('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': res.getHeader('Access-Control-Allow-Headers'),
        'Access-Control-Allow-Credentials': res.getHeader('Access-Control-Allow-Credentials')
      });
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        console.log('CUSTOM CORS: Handling OPTIONS preflight request');
        res.status(204).end();
        return next();
      }
      
      console.log('CUSTOM CORS: CORS middleware completed successfully');
      return next();
    } catch (error) {
      console.error('CUSTOM CORS: Error during CORS middleware execution:', error);
      console.error('CUSTOM CORS: Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      return next(error);
    }
  };
}

// For CommonJS compatibility
// @ts-ignore
if (typeof module !== 'undefined') {
  // @ts-ignore
  module.exports = {
    corsMiddleware
  };
} 