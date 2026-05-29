import { Request, Response, NextFunction } from "express";

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // In a real application, this would be extracted from a verified JWT token.
    // For this implementation, we extract it from the custom header set by the frontend.
    const userRole = req.header("X-User-Role") || "Read-Only";

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: "Forbidden: You do not have the required permissions to perform this action.",
      });
    }

    next();
  };
};

export const requireCrudOrAdmin = requireRole(["CRUD", "Admin"]);
export const requireAdmin = requireRole(["Admin"]);
