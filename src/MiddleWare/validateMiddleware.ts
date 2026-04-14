import { Request, Response, NextFunction } from "express";
import { ZodTypeAny, ZodError } from "zod";

export const validate = (schema: ZodTypeAny) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // parseAsync checks body, query, and params
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          // Use .issues instead of .errors for better compatibility
          message: error.issues[0].message, 
        });
      }
      return res.status(500).json({ 
        success: false, 
        message: "Internal Server Error" 
      });
    }
  };