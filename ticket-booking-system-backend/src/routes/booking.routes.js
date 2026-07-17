const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const { createBookingController } = require("../controllers/booking.controller");

const router = express.Router();

router.post(
  "/confirm",
  authMiddleware,
  roleMiddleware("CUSTOMER"),
  createBookingController
);

module.exports = router;
