const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  role: z.enum([
    "CUSTOMER",
    "ORGANISER"
  ]).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

module.exports = {
  registerSchema,
  loginSchema
};