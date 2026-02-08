import { Booking, BookingInstance } from "./bookingModel.js";


export const bookingService = {
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
