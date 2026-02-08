import { Request, Response } from "express";
import { roomService } from "./roomService.js";

function roomErrorStatus(message: string): number {
  if (message === "Room not found" || message === "User not found") return 404;
  if (
    message === "Room name is required" ||
    message === "Room id is required" ||
    message === "Valid userId is required" ||
    message === "Start date must be before end date"
  ) return 400;
  if (message === "A room with this name already exists") return 409;
  if (message === "Room has bookings. Delete them before deleting the room") return 409;
  return 500;
}

export const roomController = {
    createRoom: async (req: Request, res: Response) => {
        try {
            const { name, userId } = req.body;
            if (!userId) {
                return res.status(401).json({ message: "User not provided. Please log in or send a valid token." });
            }
            const room = await roomService.createRoom(userId as number, { name });
            return res.status(201).json({ message: "Room created successfully", room });
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Internal server error";
            const status = roomErrorStatus(msg);
            return res.status(status).json({ message: msg });
        }
    },
    getRoom: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const room = await roomService.getRoom(Number(id));
            return res.status(200).json({ message: "Room found", room });
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Internal server error";
            const status = roomErrorStatus(msg);
            return res.status(status).json({ message: msg });
        }
    },
    updateRoom: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { name } = req.body;
            const room = await roomService.updateRoom(Number(id), { name });
            return res.status(200).json({ message: "Room updated successfully", room });
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Internal server error";
            const status = roomErrorStatus(msg);
            return res.status(status).json({ message: msg });
        }
    },
    deleteRoom: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const room = await roomService.deleteRoom(Number(id));
            return res.status(200).json({ message: "Room deleted successfully", room });
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Internal server error";
            const status = roomErrorStatus(msg);
            return res.status(status).json({ message: msg });
        }
    },
    getRooms: async (req: Request, res: Response) => {
        try {
            const { limit, offset } = req.query;
            const { userId } = req.body;
            const uid = Number(userId);
            const lim = limit != null ? Number(limit) : undefined;
            const off = offset != null ? Number(offset) : undefined;
            if (Number.isNaN(uid)) {
                return res.status(401).json({ message: "User not provided. Please log in or send a valid token." });
            }
            if ((lim != null && Number.isNaN(lim)) || (off != null && Number.isNaN(off))) {
                return res.status(400).json({ message: "limit and offset must be valid numbers." });
            }
            const rooms = await roomService.getRooms(uid, lim, off);
            return res.status(200).json({ message: "Rooms found", rooms });
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Internal server error";
            const status = roomErrorStatus(msg);
            return res.status(status).json({ message: msg });
        }
    },
    createBooking: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { userId, start_at, end_at, title } = req.body;
            const booking = await roomService.createBooking(Number(id), { userId, start_at, end_at, title });
            return res.status(201).json({ message: "Booking created successfully", booking });
        } catch (error: unknown) {
            const err = error as Error & { conflictsWith?: { id: number; start_at: Date; end_at: Date; title: string }[] };
            if (err.message === "BOOKING_CONFLICT" && err.conflictsWith) {
                const conflictingRanges = err.conflictsWith.map((c) => ({
                    id: c.id,
                    title: c.title,
                    start_at: typeof c.start_at === "string" ? c.start_at : (c.start_at as Date).toISOString(),
                    end_at: typeof c.end_at === "string" ? c.end_at : (c.end_at as Date).toISOString(),
                }));
                return res.status(409).json({
                    error: "BOOKING_CONFLICT",
                    message: "The requested booking overlaps with one or more existing bookings.",
                    conflictingRanges,
                });
            }
            const msg = err instanceof Error ? err.message : "Internal server error";
            const status = roomErrorStatus(msg);
            return res.status(status).json({ message: msg });
        }
    },
    getBookingsFiltered: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { limit, offset, from, to } = req.query;
            const { rows, count } = await roomService.getBookingsFiltered(
                Number(id),
                new Date(from as string),
                new Date(to as string),
                limit != null ? Number(limit) : undefined,
                offset != null ? Number(offset) : undefined,
            );
            return res.status(200).json({ message: "Bookings found", rows, count });
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Internal server error";
            const status = roomErrorStatus(msg);
            return res.status(status).json({ message: msg });
        }
    },
};