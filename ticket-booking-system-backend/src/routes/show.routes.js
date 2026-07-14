const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const {
  createShowController,
  createShowPricingController
  ,
  getShowSeatsController
} = require("../controllers/show.controller");

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  roleMiddleware("ORGANISER"),
  createShowController
);

router.post(
  "/:showId/pricing",
  authMiddleware,
  roleMiddleware("ORGANISER"),
  createShowPricingController
);

router.get(
  "/:showId/seats",
  getShowSeatsController
);

module.exports = router;
