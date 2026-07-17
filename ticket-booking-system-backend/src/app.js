const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes =
  require("./routes/auth.routes");

const venueRoutes =
  require("./routes/venue.route");

const seatRoutes =
  require("./routes/seat.route");

const eventRoutes =
  require("./routes/event.routes");

const showRoutes = require("./routes/show.routes");
const bookingRoutes = require("./routes/booking.routes");

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use(express.json());

app.use(
  "/api/v1/auth",
  authRoutes
);

app.use(
  "/api/v1/venues",
  venueRoutes
);

app.use(
  "/api/v1/seats",
  seatRoutes
);

app.use(
  "/api/v1/events",
  eventRoutes
);

app.use(
  "/api/v1/shows",
  showRoutes
);

app.use(
  "/api/v1/bookings",
  bookingRoutes
);

module.exports = app;