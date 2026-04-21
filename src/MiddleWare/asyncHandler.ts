import { Request, Response, NextFunction } from "express";

/**
 * @description: Global wrapper to catch errors in async functions
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};