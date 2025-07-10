import { Request, Response, NextFunction } from 'express';

export function headerToLocals(req: Request, res: Response, next: NextFunction) {
  const userIdHeader = req.header('x-user-id');
  const emailHeader = req.header('x-user-email');
  if (userIdHeader) {
    const userId = parseInt(userIdHeader, 10);
    if (!isNaN(userId)) {
      res.locals.user = {
        userId,
        email: emailHeader || '',
      };
    }
  }
  next();
}
