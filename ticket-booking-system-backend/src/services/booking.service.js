const crypto = require("crypto");
const pool = require("../config/db");
const {
  generateQrTicket,
  ensureQrTicket,
  makeVerificationUrl
} = require("../utils/qr");
const { sendMail } = require("../utils/mailer");

const formatAmount = (amount) => {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  });

  return formatter.format(amount);
};

const formatShowDateTime = (date) => {
  const dateString = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  const timeString = date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });

  return `${dateString} • ${timeString}`;
};

const createBooking = async (user, showId, seatIds) => {
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
  s.row_label,
  s.seat_number,
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
      (seat) => seat.held_by !== user.id
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
      [bookingReference, user.id, showId, totalAmount]
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

    const booking = bookingResult.rows[0];
    const qrResult = await generateQrTicket({
      bookingReference: booking.booking_reference,
      bookingId: booking.id,
      showId,
      userId: user.id
    });

    const seatLabels = seatResult.rows
      .map((row) => ({
        rowLabel: row.row_label,
        seatNumber: row.seat_number
      }))
      .sort((a, b) => {
        if (a.rowLabel === b.rowLabel) {
          return a.seatNumber - b.seatNumber;
        }

        return a.rowLabel.localeCompare(b.rowLabel);
      })
      .map((seat) => `${seat.rowLabel}${seat.seatNumber}`);

    const showResult = await pool.query(
      `
      SELECT
        e.title AS event_title,
        v.name AS venue_name,
        s.start_time
      FROM shows s
      JOIN events e
        ON s.event_id = e.id
      JOIN venues v
        ON s.venue_id = v.id
      WHERE s.id = $1
      `,
      [showId]
    );

    const showRow = showResult.rows[0] || {};
    const showTime = showRow.start_time
      ? formatShowDateTime(new Date(showRow.start_time))
      : "";
    const amountText = formatAmount(totalAmount);

    
    try {
      console.log("Sending email...");
      await sendMail({
        to: user.email,
        subject: `Booking Confirmed - ${booking.booking_reference}`,
        text: `Booking Confirmed\n\nBooking Reference: ${booking.booking_reference}\n\nMovie: ${showRow.event_title || ""}\nVenue: ${showRow.venue_name || ""}\nShow: ${showTime}\nSeats: ${seatLabels.join(", ")}\nAmount: ${amountText}\n\nYour QR code ticket is attached.`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h1>Booking Confirmed</h1>
            <p><strong>Booking Reference:</strong> ${booking.booking_reference}</p>
            <p><strong>Movie:</strong> ${showRow.event_title || ""}</p>
            <p><strong>Venue:</strong> ${showRow.venue_name || ""}</p>
            <p><strong>Show:</strong> ${showTime}</p>
            <p><strong>Seats:</strong> ${seatLabels.join(", ")}</p>
            <p><strong>Amount:</strong> ${amountText}</p>
            <div style="margin-top: 20px;">
              <p><strong>QR Code</strong></p>
              <img src="cid:bookingQrCode" alt="QR Code Ticket" style="max-width: 320px; height: auto;" />
            </div>
          </div>
        `,
        attachments: [
          {
            filename: `${booking.booking_reference}.png`,
            content: qrResult.qrCodeBase64.split(",")[1],
            encoding: "base64",
            cid: "bookingQrCode"
          }
        ]
      });
      console.log("Email sent successfully.");
    } catch (mailError) {
      console.error(
        "Booking created but email send failed:",
        mailError.message || mailError
      );
    }

    return {
      ...booking,
      qrCodeUrl: qrResult.qrCodeUrl
    };
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
        show_id,
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

  const bookingRow = bookingResult.rows[0];
  const { qrCodeUrl } = await ensureQrTicket({
    bookingReference: bookingRow.bookingReference,
    bookingId,
    showId: bookingRow.show_id,
    userId
  });

  return {
    bookingReference: bookingRow.bookingReference,
    amount: bookingRow.amount,
    qrCodeUrl,
    verificationUrl: makeVerificationUrl(bookingRow.bookingReference),
    seats: seatsResult.rows.map(
      (seat) => `${seat.row_label}${seat.seat_number}`
    )
  };
};

const verifyBooking = async (bookingReference) => {
  const bookingResult = await pool.query(
    `
    SELECT
      id,
      booking_reference AS "bookingReference",
      user_id,
      show_id,
      total_amount AS amount,
      status,
      created_at
    FROM bookings
    WHERE booking_reference = $1
    `,
    [bookingReference]
  );

  if (!bookingResult.rows.length) {
    throw new Error("Booking not found");
  }

  const bookingRow = bookingResult.rows[0];
  const seatsResult = await pool.query(
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
    [bookingRow.id]
  );

  return {
    bookingReference: bookingRow.bookingReference,
    status: bookingRow.status,
    showId: bookingRow.show_id,
    amount: bookingRow.amount,
    createdAt: bookingRow.created_at,
    seats: seatsResult.rows.map(
      (seat) => `${seat.row_label}${seat.seat_number}`
    )
  };
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingDetails,
  verifyBooking
};
