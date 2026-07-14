const { z } = require("zod");

const createShowSchema = z.object({
  eventId: z.string().uuid(),
  venueId: z.string().uuid(),
  startTime: z.string().refine((s) => !isNaN(Date.parse(s)), {
    message: "startTime must be a valid ISO date string"
  }),
  endTime: z.string().refine((s) => !isNaN(Date.parse(s)), {
    message: "endTime must be a valid ISO date string"
  })
});

const createShowPricingSchema = z.object({
  prices: z
    .array(
      z.object({
        categoryId: z.string().uuid(),
        price: z.number().positive()
      })
    )
    .min(1, "At least one pricing entry is required")
});

module.exports = {
  createShowSchema,
  createShowPricingSchema
};
