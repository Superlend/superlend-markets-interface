import { NextApiRequest, NextApiResponse } from 'next';

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
export function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  console.log('MIDDLEWARE: Starting runMiddleware execution');
  console.log('MIDDLEWARE: Request method:', req.method);
  console.log('MIDDLEWARE: Request path:', req.url);
  
  return new Promise((resolve, reject) => {
    console.log('MIDDLEWARE: Setting up middleware promise');
    
    // Define a callback function to handle middleware completion
    const callback = (result: any) => {
      console.log('MIDDLEWARE: Middleware callback invoked');
      
      if (result instanceof Error) {
        console.error('MIDDLEWARE: Middleware failed with error:', result);
        console.error('MIDDLEWARE: Error details:', {
          name: result.name,
          message: result.message,
          stack: result.stack
        });
        return reject(result);
      }

      console.log('MIDDLEWARE: Middleware completed successfully');
      console.log('MIDDLEWARE: Result:', result);
      return resolve(result);
    };
    
    try {
      console.log('MIDDLEWARE: Calling middleware function');
      fn(req, res, callback);
      console.log('MIDDLEWARE: Middleware function called successfully');
    } catch (error) {
      console.error('MIDDLEWARE: Exception thrown during middleware execution:', error);
      console.error('MIDDLEWARE: Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      reject(error);
    }
  });
}

// For CommonJS compatibility
// @ts-ignore
if (typeof module !== 'undefined') {
  // @ts-ignore
  module.exports = {
    runMiddleware
  };
} 