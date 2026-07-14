const {
  createEvent,
  getAllEvents
  ,
  getEventById
} = require("../services/event.service");
const { createEventSchema } = require("../validators/event.validator");

const createEventController = async (req, res) => {
  try {
    const validatedData = createEventSchema.parse(req.body);
    const organiserId = req.user.id;

    const event = await createEvent(validatedData, organiserId);

    return res.status(201).json({
      success: true,
      event
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getAllEventsController = async (req, res) => {
  try {
    const events = await getAllEvents();

    return res.status(200).json(events);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getEventByIdController = async (req, res) => {
  try {
    const { eventId } = req.params;
    const result = await getEventById(eventId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createEventController,
  getAllEventsController,
  getEventByIdController
};
