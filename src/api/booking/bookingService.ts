import { Booking, BookingInstance } from "./bookingModel.js";


export const bookingService = {
    getBookingsByUserId: async (userId: number) => {
        if (userId == null || Number.isNaN(Number(userId))) {
            throw new Error("Valid userId is required");
        }
        const rows = await Booking.findAll({
            where: { userId },
            order: [["start_at", "ASC"]],
        });
        return { rows, count: rows.length };
    },
    deleteBooking: async (id: number, userId: number) => {
        try {
            if (!id) {
                throw new Error("Booking id is required");
            }
            const bookingRaw = await Booking.findByPk(id);
            const booking = bookingRaw as BookingInstance | null;
            if (!booking) {
                throw new Error("Booking not found");
            }
            if(booking.userId !== userId) {
                throw new Error("You are not authorized to delete this booking");
            }
            if (booking.status === "in_progress") {
                throw new Error("Booking is active. Deactivate it before deleting");
            }
            await booking.destroy();
            return booking;
        } catch (error : unknown) {
            throw new Error(error instanceof Error ? error.message : String(error));
        }
},
}
