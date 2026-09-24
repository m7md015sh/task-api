declare global {
  namespace Express {
    interface Request {
      requestId: string;

      /**
       * user is optional here because it is only attached by the auth middleware.
       * Routes that use auth middleware can safely assert req.user is defined.
       */
      user?: {
        id: string;
      };
    }
  }
}

export {};