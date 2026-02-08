import { Router } from "express";
import { auth } from "../auth/middleware/auth.js";
import { validator } from "../../middleware/validator.js";
import { roomController } from "./roomController.js";

const router = Router();


router.post("/rooms", auth, validator.validatorRoom, roomController.createRoom);
router.get("/rooms", auth, roomController.getRooms);

router.get("/rooms/:id", auth, validator.validatorParamId, roomController.getRoom);
router.put("/rooms/:id", auth, validator.validatorParamId, validator.validatorRoom, roomController.updateRoom);
router.delete("/rooms/:id", auth, validator.validatorParamId, roomController.deleteRoom);

router.post("/rooms/:id/bookings", auth, validator.validatorParamId, validator.validatorBooking, roomController.createBooking);
router.get("/rooms/:id/bookings", auth, validator.validatorParamId, validator.validatorGetBookings, roomController.getBookingsFiltered);

export default router;