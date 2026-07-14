const { z } = require("zod");

const createEventSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  eventType: z.enum(["MOVIE", "CONCERT"]),
  durationMinutes: z.number().positive(),
  posterUrl: z.string().optional()
});

module.exports = {
  createEventSchema
};
