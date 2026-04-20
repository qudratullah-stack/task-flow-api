import { Request, Response, NextFunction } from "express";

/**
 * @description: Professional Role-based access control (RBAC)
 * @security: Higher-level abstraction to prevent unauthorized access
 */
export const authorize = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        
        // 1. Check if user is authenticated (Set by protect middleware)
        if (!(req as any).user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please log in first."
            });
        }

        const userRole = (req as any).user.role;

        // 2. Check if the user's role is included in the allowedRoles array
        if (!allowedRoles.includes(userRole)) {
           
            return res.status(403).json({
                success: false,
                message: `Access Denied: Your role '${userRole}' does not have permission for this resource.`
            });
        }
        next();
    };
};