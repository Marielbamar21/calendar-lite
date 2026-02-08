import { Request, Response } from "express";
import { bookingService } from "./bookingService.js";

function bookingErrorStatus(message: string): number {
  if (message === "Booking id is required") return 400;
  if (message === "Booking not found") return 404;
  if (message === "You are not authorized to delete this booking") return 403;
  if (message === "Booking is active. Deactivate it before deleting") return 409;
  return 500;
}

export const bookingController = {
    deleteBooking: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { userId } = req.body;
            if (!userId) {
                return res.status(401).json({ message: "User not provided. Please log in or send a valid token." });
            }
            const booking = await bookingService.deleteBooking(Number(id), Number(userId));
            return res.status(200).json({ message: "Booking deleted successfully", booking });
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Internal server error";
            const status = bookingErrorStatus(msg);
            return res.status(status).json({ message: msg });
        }
    },
}