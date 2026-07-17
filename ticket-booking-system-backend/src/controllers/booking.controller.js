const { createBooking } = require("../services/booking.service");
const { createBookingSchema } = require("../validators/booking.validator");
const { ZodError } = require("zod");

const createBookingController = async (req, res) => {
  try {
    const parsed = createBookingSchema.parse(req.body);
    const userId = req.user.id;

    const booking = await createBooking(
      userId,
      parsed.showId,
      parsed.seatIds
    );

    return res.status(201).json({
      success: true,
      booking
    });
  } catch (error) {

if (error instanceof ZodError) {
  return res.status(400).json({
    success: false,
    message: error.issues.map(
      (issue) => issue.message
    ).join(", ")
  });
}

    if (error.message.includes("not held")) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes("not held by the current user")) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes("invalid")) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createBookingController
};
