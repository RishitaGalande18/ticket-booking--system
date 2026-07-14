const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const {
  createEventController,
  getAllEventsController,
  getEventByIdController
} = require("../controllers/event.controller");

const router = express.Router();

router.get("/", getAllEventsController);

router.get("/:eventId", getEventByIdController);

router.post(
  "/create",
  authMiddleware,
  roleMiddleware("ORGANISER"),
  createEventController
);

module.exports = router;
