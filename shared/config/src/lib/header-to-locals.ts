import { Request, Response, NextFunction } from 'express';

export function headerToLocals(req: Request, res: Response, next: NextFunction) {
  const userIdHeader = req.header('x-user-id');
  const emailHeader = req.header('x-user-email');
  if (userIdHeader) {
    res.locals.user = {
      userId: Number(userIdHeader),
      email: emailHeader || '',
    };
  }
  next();
}
