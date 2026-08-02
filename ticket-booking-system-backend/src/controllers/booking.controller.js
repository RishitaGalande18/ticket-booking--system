const {
  createBooking,
  getMyBookings,
  getBookingDetails,
  verifyBooking
} = require("../services/booking.service");
const {
  createBookingSchema,
  bookingIdSchema,
  bookingReferenceSchema
} = require("../validators/booking.validator");
const { ZodError } = require("zod");


const createBookingController = async (req, res) => {
  try {
    const parsed = createBookingSchema.parse(req.body);
    const booking = await createBooking(
      req.user,
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

const getMyBookingsController =
  async (req, res) => {

    try {

      const userId = req.user.id;

      const bookings =
        await getMyBookings(userId);

      return res.status(200).json({
        success: true,
        data: bookings
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message: error.message
      });

    }

  };

  const getBookingDetailsController =
  async (req, res) => {

    try {

      const { bookingId } =
        bookingIdSchema.parse(
          req.params
        );

      const booking =
        await getBookingDetails(
          bookingId,
          req.user.id
        );

      return res.status(200).json({
        success: true,
        data: booking
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message: error.message
      });

    }

  };

  const verifyBookingController = async (req, res) => {
    try {
      const { bookingReference } = bookingReferenceSchema.parse(req.params);
      const booking = await verifyBooking(bookingReference);

      return res.status(200).json({
        success: true,
        data: booking
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: error.issues.map((issue) => issue.message).join(", ")
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

module.exports = {
  createBookingController,
  getMyBookingsController,
  getBookingDetailsController,
  verifyBookingController
};
