import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();

export interface AuthRequest extends Request {
    userId?: string;
}

const SECRETKEY = process.env.JWT_SECRET;

export const userMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.token;
        if (!token || typeof token != "string" || !SECRETKEY) {
            res.status(401).json({ message: "No token provided, authorization denied" });
            return;
        }
        // console.log(token);
        const decoded = jwt.verify(token, SECRETKEY) as { id: string };
        // console.log(decoded);
        if (decoded) {
            req.userId = decoded.id;
            next();
        }
        else {
            res.status(400).json({
                "message": "Login Expired please login again"
            })
        }
    }
    catch (err) {
        res.status(500).json({ message: err })
    }
}