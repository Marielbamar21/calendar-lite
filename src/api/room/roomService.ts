import { Booking } from "../booking/bookingModel.js";
import { Room, RoomInstance } from "./roomModel.js";
import { Op } from "sequelize";
import { User } from "../user/userModel.js";

export const roomService = {
  createRoom: async (userId: number, data: { name: string }) => {
    try {
      if (!data.name) {
        throw new Error("Room name is required");
      }
      const existingRoom = await Room.findOne({ where: { name: data.name, createdBy: userId } });
      if (existingRoom) {
        throw new Error("A room with this name already exists");
      }
      const room = await Room.create({ name: data.name, createdBy: userId });
      return room;
    } catch (error: unknown) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  },
  getRoom: async (id: number) => {
    try {
      if (!id) {
        throw new Error("Room id is required");
      }
      const room = await Room.findByPk(id);
      if (!room) {
        throw new Error("Room not found");
      }
      return room;
    } catch (error: unknown) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  },
  updateRoom: async (id: number, data: { name: string }) => {
    try {
      if (!id) {
        throw new Error("Room id is required");
      }
      if (!data.name) {
        throw new Error("Room name is required");
      }
      const room = await Room.findByPk(id);
      if (!room) {
        throw new Error("Room not found");
      }
      await room.update({ name: data.name });
      return room;
    } catch (error: unknown) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  },
  deleteRoom: async (id: number) => {
    try {
      if (!id) {
        throw new Error("Room id is required");
      }
      const [room, bookings] = await Promise.all([
        Room.findByPk(id),
        Booking.findAll({ where: { roomId: id } }),
      ]);
      if (!room) {
        throw new Error("Room not found");
      }
      if (bookings.length > 0) {
        throw new Error("Room has bookings. Delete them before deleting the room");
      }
      await room.destroy();
      return room;
    } catch (error: unknown) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  },
  getRooms: async (userId: number, limit?: number, offset?: number) => {
    try {
      if (userId == null || Number.isNaN(Number(userId))) {
        throw new Error("Valid userId is required");
      }
      const safeLimit = limit != null && !Number.isNaN(Number(limit)) ? Number(limit) : 10;
      const safeOffset = offset != null && !Number.isNaN(Number(offset)) ? Number(offset) : 0;
        const { rows, count } = await Room.findAndCountAll({
        where: { createdBy: userId },
        attributes: ["id", "name"],
        raw: true,
        limit: safeLimit,
        offset: safeOffset,
      });
      return { rows, count };
    } catch (error: unknown) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  },
  createBooking: async (id: number, bookingData: { userId: number, start_at: Date, end_at: Date, title: string }) => {
    try {
      const [roomRaw, user] = await Promise.all([
        Room.findByPk(id),
        User.findByPk(bookingData.userId),
      ]);
      const room = roomRaw as RoomInstance | null;

      if (!room || !user) {
        throw new Error(!room ? "Room not found" : "User not found");
      }
      if (bookingData.start_at >= bookingData.end_at) {
        throw new Error("Start date must be before end date");
      }
      const conflicting = await Booking.findAll({
        where: {
          roomId: id,
          [Op.and]: [
            { start_at: { [Op.lt]: bookingData.end_at } },
            { end_at: { [Op.gt]: bookingData.start_at } },
          ],
        },
        attributes: ["id", "start_at", "end_at", "title"],
      });

      if (conflicting.length > 0) {
        const conflictsWith = (conflicting as unknown as { id: number; start_at: Date; end_at: Date; title: string }[]).map(
          (b) => ({ id: b.id, start_at: b.start_at, end_at: b.end_at, title: b.title }),
        );
        const err = new Error("BOOKING_CONFLICT") as Error & { conflictsWith: typeof conflictsWith };
        err.conflictsWith = conflictsWith;
        throw err;
      }
      const booking = await Booking.create({ ...bookingData, roomId: id });
      return booking;
    } catch (error: unknown) {
      if (error instanceof Error && "conflictsWith" in error) throw error;
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  },
  getBookingsFiltered: async (roomId: number, from: Date, to: Date, limit?: number, offset?: number) => {
    try {
      if (!roomId) {
        throw new Error("Room id is required");
      }
      const { rows, count } = await Booking.findAndCountAll({
        where: {
          roomId,
          start_at: { [Op.lt]: to },
          end_at: { [Op.gt]: from },
        },
        order: [["start_at", "ASC"]],
        limit: limit || 10,
        offset: offset != null ? offset : 0,
      });
      return { rows, count };
    } catch (error: unknown) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }
}