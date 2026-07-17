const { z } = require("zod");

const createBookingSchema = z.object({
  showId: z.string().uuid(),
  seatIds: z
    .array(z.string().uuid())
    .min(1, "At least one seatId is required")
});

const bookingIdSchema = z.object({
  bookingId: z.uuid()
});

module.exports = {
  createBookingSchema,
  bookingIdSchema
};
