import { Router } from "express";
import { auth } from "../auth/middleware/auth.js";
import { validator } from "../../middleware/validator.js";
import { bookingController } from "./bookingController.js";

const router = Router();

router.delete("/bookings/:id", auth, validator.validatorParamId, bookingController.deleteBooking);

export default router;
