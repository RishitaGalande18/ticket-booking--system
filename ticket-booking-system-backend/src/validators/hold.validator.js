const { z } = require("zod");

const createHoldSchema = z.object({
  showId: z.string().uuid(),
  seatIds: z
    .array(z.string().uuid())
    .min(1, "At least one seatId is required")
});

module.exports = {
  createHoldSchema
};
