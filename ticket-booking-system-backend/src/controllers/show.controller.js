const {
  createShow,
  createShowPricing
  ,
  getShowSeatMap
} = require("../services/show.service");
const {
  createShowSchema,
  createShowPricingSchema
} = require("../validators/show.validator");

const createShowController = async (req, res) => {
  try {
    const parsed = createShowSchema.parse(req.body);

    const organiserId = req.user.id;

    const result = await createShow(parsed, organiserId);

    return res.status(201).json({
      success: true,
      show: result.show,
      showSeatsCreated: result.showSeatsCreated
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: error.errors.map((e) => e.message).join(", ")
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createShowPricingController = async (req, res) => {
  try {
    const parsed = createShowPricingSchema.parse(req.body);
    const { showId } = req.params;

    const result = await createShowPricing(showId, parsed.prices);

    return res.status(201).json({
      success: true,
      showId,
      showPricingCreated: result.rowsInserted
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: error.errors.map((e) => e.message).join(", ")
      });
    }

    const statusCode =
      error.message === "Show not found" ? 404 : 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};


const getShowSeatsController = async (req, res) => {
  try {
    const { showId } = req.params;
    const seats = await getShowSeatMap(showId);

    return res.status(200).json(seats);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createShowController,
  createShowPricingController,
  getShowSeatsController
};
