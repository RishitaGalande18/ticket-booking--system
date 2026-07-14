const express = require("express");
const authMiddleware =
  require("../middlewares/auth.middleware");
const roleMiddleware =
  require("../middlewares/role.middleware");

const {
  createVenueController,
  getVenueLayoutController,
} = require("../controllers/venue.controller");

const router = express.Router();

router.post(
    "/create",
    authMiddleware,
    roleMiddleware("ADMIN"),
    createVenueController
);

router.get(
    "/:venueId/layout",
    getVenueLayoutController
);

module.exports = router;