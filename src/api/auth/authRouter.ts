import express from "express";
import { authController } from "./authController.js";
import { auth } from "./middleware/auth.js";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/verify", auth, authController.verify);

export default router;
