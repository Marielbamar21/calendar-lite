import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, type UserInstance } from "../user/userModel.js";
import { config } from "../../../config/index.js"
import { Request, Response } from "express";
export const authController ={
    register: async (req : Request, res: Response) => {
        const { name, username, email, password } = req.body;
        try {
          if (!name || !username || !email || !password) {
            return res.status(400).json({ message: "All fields are required: name, username, email, password." });
          }
          const existByEmail = await User.findOne({ where: { email } });
          if (existByEmail) {
            return res.status(409).json({ message: "A user with this email already exists." });
          }
          const existByName = await User.findOne({ where: { name } });
          if (existByName) {
            return res.status(409).json({ message: "Name already exists." });
          }
          const hashedPassword = await bcrypt.hash(password, 10);
          const user = await User.create({
            name,
            username,
            email,
            password: hashedPassword,
          });
          const { password: _, ...userWithoutPassword } = user.toJSON() as UserInstance & { password: string };
          return res.status(201).json({ message: "User created successfully", userWithoutPassword });
        } catch {
          return res.status(500).json({ message: "Internal server error. Registration could not be completed." });
        }
      },
      login: async (req: Request, res: Response) => {
        const { email, password } = req.body;
        try {
          if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
          }
          const userRaw = await User.findOne({ where: { email } });
          const user = userRaw as UserInstance | null;
          if (!user) {
            return res.status(401).json({ message: "Invalid credentials. User not found." });
          }
          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            return res.status(401).json({ message: "Invalid credentials. Invalid password." });
          }
          const token = jwt.sign({ id: user.id }, config.jwt_secret as string, { expiresIn: "7d" });
          return res.status(200).json({ message: "Login successful", token });
        } catch {
          return res.status(500).json({ message: "Internal server error. Login could not be completed." });
        }
      },
      verify: async (req: Request, res: Response) => {
        const userId = (req as Request & { userId?: number }).userId ?? req.body?.userId;
        return res.status(200).json({ valid: true, userId });
      },
}