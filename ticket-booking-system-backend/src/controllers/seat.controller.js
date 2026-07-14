const {
  createSeatCategory
} = require("../services/seat_category.service");

const {
  createSeats
} = require("../services/bulk-seat.service");

//creating seat category for a venue
const createSeatCategoryController =
  async (req, res) => {

    try {

      const {
        venueId,
        name,
        color
      } = req.body;

      const seatCategory =
        await createSeatCategory(
          venueId,
          name,
          color
        );

      return res.status(201).json({
        success: true,
        data: seatCategory
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message: error.message
      });

    }
  };

//Creating bulk seats
const createSeatsController = async (
  req,
  res
) => {

  try {

    const {
      venueId,
      rows
    } = req.body;

    if (!venueId) {
      return res.status(400).json({
        success: false,
        message: "Venue ID is required"
      });
    }

    if (
      !rows ||
      !Array.isArray(rows) ||
      rows.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Rows are required"
      });
    }

    const result =
      await createSeats(
        venueId,
        rows
      );

    return res.status(201).json({
      success: true,
      message: "Seats created successfully",
      data: result
    });

  } catch (error) {
    const statusCode =
      error.message === "Venue not found" ||
      error.message.includes("does not belong to venue")
        ? 400
        : 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message
    });

  }

};

module.exports = {
  createSeatCategoryController,
  createSeatsController
};