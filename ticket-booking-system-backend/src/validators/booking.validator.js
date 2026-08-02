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

const bookingReferenceSchema = z.object({
  bookingReference: z.string().regex(/^BOOK-[A-F0-9]{8}$/, "Invalid booking reference")
});

module.exports = {
  createBookingSchema,
  bookingIdSchema,
  bookingReferenceSchema
};
