const express = require("express");
const authMiddleware =
  require("../middlewares/auth.middleware");

const {
  register
} = require("../controllers/auth.controller");

const {
  login
} = require("../controllers/auth.controller");

const {
  me
} = require("../controllers/auth.controller");

const router = express.Router();

router.post(
  "/register",
  register
);
router.post(
    "/login", 
    login
);
router.get(
  "/me",
  authMiddleware,
  me
);

module.exports = router;