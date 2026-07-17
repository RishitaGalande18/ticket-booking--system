const crypto = require("crypto");
const pool = require("../config/db");

const createBooking = async (userId, showId, seatIds) => {
  if (!Array.isArray(seatIds) || seatIds.length === 0) {
    throw new Error("At least one seatId is required for booking");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const seatResult = await client.query(
      `
      SELECT
  ss.id,
  ss.status,
  ss.held_by,
  s.category_id,
  sp.price
FROM show_seats ss

JOIN seats s
  ON ss.seat_id = s.id

LEFT JOIN show_pricing sp
  ON sp.show_id = ss.show_id
  AND sp.category_id = s.category_id

WHERE ss.show_id = $1
  AND ss.id = ANY($2)

FOR UPDATE OF ss
      `,
      [showId, seatIds]
    );

    if (seatResult.rows.length !== seatIds.length) {
      throw new Error("One or more seats are invalid");
    }

    const invalidSeat = seatResult.rows.find(
      (seat) => seat.status !== "HELD"
    );

    if (invalidSeat) {
      throw new Error(`Seat ${invalidSeat.id} is not held`);
    }

    const unauthorizedSeat = seatResult.rows.find(
      (seat) => seat.held_by !== userId
    );

    if (unauthorizedSeat) {
      throw new Error(
        `Seat ${unauthorizedSeat.id} is not held by the current user`
      );
    }

    const totalAmount = seatResult.rows.reduce((sum, row) => {
      if (row.price === null) {
        throw new Error(`Price not configured for seat ${row.id}`);
      }

      return sum + Number(row.price);
    }, 0);

    const bookingReference = `BOOK-${crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase()}`;

    const bookingResult = await client.query(
      `
      INSERT INTO bookings (
        booking_reference,
        user_id,
        show_id,
        total_amount,
        status
      )
      VALUES ($1, $2, $3, $4, 'CONFIRMED')
      RETURNING id, booking_reference, user_id, show_id, total_amount, status, created_at
      `,
      [bookingReference, userId, showId, totalAmount]
    );

    const bookingId = bookingResult.rows[0].id;

    await client.query(
      `
      INSERT INTO booking_seats (
        booking_id,
        show_seat_id
      )
      SELECT $1, id
      FROM show_seats
      WHERE id = ANY($2)
      `,
      [bookingId, seatIds]
    );

    await client.query(
      `
      UPDATE show_seats
      SET
        status = 'BOOKED',
        held_by = NULL,
        hold_expires_at = NULL
      WHERE id = ANY($1)
      `,
      [seatIds]
    );

    await client.query("COMMIT");

    return bookingResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getMyBookings = async (userId) => {

  const result = await pool.query(
    `
    SELECT
      b.booking_reference AS "bookingReference",
      e.title AS "showTitle",
      b.total_amount AS "totalAmount",
      b.status
    FROM bookings b
    JOIN shows s
      ON b.show_id = s.id
    JOIN events e
      ON s.event_id = e.id
    WHERE b.user_id = $1
    ORDER BY b.created_at DESC
    `,
    [userId]
  );

  return result.rows;
};

const getBookingDetails = async (
  bookingId,
  userId
) => {

  const bookingResult =
    await pool.query(
      `
      SELECT
        booking_reference AS "bookingReference",
        total_amount AS amount
      FROM bookings
      WHERE id = $1
      AND user_id = $2
      `,
      [bookingId, userId]
    );

  if (!bookingResult.rows.length) {
    throw new Error("Booking not found");
  }

  const seatsResult =
    await pool.query(
      `
      SELECT
        s.row_label,
        s.seat_number
      FROM booking_seats bs
      JOIN show_seats ss
        ON bs.show_seat_id = ss.id
      JOIN seats s
        ON ss.seat_id = s.id
      WHERE bs.booking_id = $1
      ORDER BY s.row_label,
               s.seat_number
      `,
      [bookingId]
    );

  return {
    bookingReference:
      bookingResult.rows[0].bookingReference,

    amount:
      bookingResult.rows[0].amount,

    seats:
      seatsResult.rows.map(
        seat =>
          `${seat.row_label}${seat.seat_number}`
      )
  };
};


module.exports = {
  createBooking,
  getMyBookings,
  getBookingDetails
};
