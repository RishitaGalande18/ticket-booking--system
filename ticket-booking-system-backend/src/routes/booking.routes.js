const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const {
  createBookingController,
  getMyBookingsController,
  getBookingDetailsController,
  verifyBookingController
} = require("../controllers/booking.controller");

const router = express.Router();

router.post(
  "/confirm",
  authMiddleware,
  roleMiddleware("CUSTOMER"),
  createBookingController
);
router.get(
  "/my",
  authMiddleware,
  getMyBookingsController
);
router.get(
  "/verify/:bookingReference",
  verifyBookingController
);
router.get(
  "/:bookingId",
  authMiddleware,
  getBookingDetailsController
);

module.exports = router;
