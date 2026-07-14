const express = require("express");

const authMiddleware =
  require("../middlewares/auth.middleware");

const roleMiddleware =
  require("../middlewares/role.middleware");

const {
  createSeatCategoryController,
} = require("../controllers/seat.controller");

const {
  createSeatsController
} = require("../controllers/seat.controller");

const router = express.Router();

router.post(
    "/create-category",
    authMiddleware,
    roleMiddleware("ADMIN"),
    createSeatCategoryController
);

router.post(
    "/bulk-create",
    authMiddleware,
    roleMiddleware("ADMIN"),
    createSeatsController
);

module.exports = router;