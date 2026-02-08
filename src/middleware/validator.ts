import type { Request, Response, NextFunction } from "express";
import { body, param, query, validationResult } from "express-validator";

export const validator = {
  validatorParamId: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await param("id")
        .notEmpty()
        .withMessage("Path parameter id is required")
        .isString().run(req);
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).json({ message: "Validation error on parameters.", errors: result.array() });
      }
      next();
    } catch (error) {
      console.log("validatorParamId", error);
      return res.status(500).json({ message: "Internal server error while validating the request." });
    }
  },
  validatorRoom: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validKeys = ["name", "userId"];
      const invalidKeys: string[] = Object.keys(req.body).filter(
        (key) => !validKeys.includes(key),
      );
      if (invalidKeys.length > 0) {
        return res
          .status(400)
          .json({ message: `Invalid keys in body: ${invalidKeys.join(", ")}. Allowed keys: name, userId.` });
      }

      await Promise.all([
        body("name").notEmpty().trim().withMessage("Room name is required"),
      ]);
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).json({ message: "Validation error on request body.", errors: result.array() });
      }
      next();
    } catch (error) {
      console.log("validatorRoom", error);
      return res.status(500).json({ message: "Internal server error while validating the request." });
    }
  },
  validatorBooking: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validKeys = [
        "title",
        "start_at",
        "end_at",
        "userId",
      ];
      const invalidKeys: string[] = Object.keys(req.body).filter(
        (key) => !validKeys.includes(key),
      );
      if (invalidKeys.length > 0) {
        return res
          .status(400)
          .json({ message: `Invalid keys in body: ${invalidKeys.join(", ")}. Allowed keys: title, start_at, end_at, userId.` });
      }
      await Promise.all([
        body("title")
          .notEmpty()
          .isString()
          .trim()
          .isLength({ min: 3, max: 80 })
          .withMessage("Title must be between 3 and 80 characters"),
        body("start_at")
          .notEmpty()
          .withMessage("Start date is required")
          .isISO8601()
          .withMessage("start_at must be a valid ISO 8601 date"),
        body("end_at")
          .notEmpty()
          .withMessage("End date is required")
          .isISO8601()
          .withMessage("end_at must be a valid ISO 8601 date"),
        body("userId")
          .notEmpty()
          .withMessage("User ID is required")
          .isInt({ min: 1 })
          .withMessage("userId must be a positive integer"),
      ]);
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).json({ message: "Validation error on request body.", errors: result.array() });
      }
      next();
    } catch (error) {
      console.log("validatorBooking", error);
      return res.status(500).json({ message: "Internal server error while validating the request." });
    }
  },
  validatorGetBookings: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validKeys = ["limit", "offset", "from", "to"];
      const invalidKeys: string[] = Object.keys(req.query).filter(
        (key) => !validKeys.includes(key),
      );
      if (invalidKeys.length > 0) {
        return res.status(400).json({ message: `Invalid query parameters: ${invalidKeys.join(", ")}. Allowed: limit, offset, from, to.` });
      }

      await Promise.all([
        query("limit").optional().isInt({ min: 1 }).withMessage("limit must be a positive integer"),
        query("offset").optional().isInt({ min: 0 }).withMessage("offset must be a non-negative integer"),
        query("from").notEmpty().withMessage("Query parameter from is required").isISO8601().withMessage("from must be a valid ISO 8601 date"),
        query("to").notEmpty().withMessage("Query parameter to is required").isISO8601().withMessage("to must be a valid ISO 8601 date"),
      ]);
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).json({ message: "Validation error on query parameters.", errors: result.array() });
      }
      next();
    } catch (error) {
      console.log("validatorGetBookings", error);
      return res.status(500).json({ message: "Internal server error while validating the request." });
    }
  },
};
