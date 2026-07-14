const { z } = require("zod");

const createVenueSchema = z.object({
    name: z.string().min(2),
    city: z.string().min(2),
    address: z.string().min(5)
});

module.exports = {
    createVenueSchema
};