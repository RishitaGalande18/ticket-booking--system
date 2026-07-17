const pool = require("../config/db");

const createShow = async (data, organiserId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const insertShowResult = await client.query(
      `
      INSERT INTO shows
      (
        event_id,
        venue_id,
        start_time,
        end_time,
        status
      )
      VALUES($1,$2,$3,$4,$5)
      RETURNING *
      `,
      [
        data.eventId,
        data.venueId,
        data.startTime,
        data.endTime,
        data.status || "UPCOMING"
      ]
    );

    const show = insertShowResult.rows[0];

    const copySeatsResult = await client.query(
      `
      INSERT INTO show_seats (show_id, seat_id)
      SELECT $1, id FROM seats WHERE venue_id = $2
      `,
      [show.id, data.venueId]
    );

    await client.query("COMMIT");

    return {
      show,
      showSeatsCreated: copySeatsResult.rowCount || 0
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const createShowPricing = async (showId, prices) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const showResult = await client.query(
      "SELECT id FROM shows WHERE id = $1",
      [showId]
    );

    if (!showResult.rows.length) {
      throw new Error("Show not found");
    }

    let rowsInserted = 0;

    for (const priceItem of prices) {
      const insertResult = await client.query(
        `
        INSERT INTO show_pricing
        (
          show_id,
          category_id,
          price
        )
        VALUES($1, $2, $3)
        `,
        [showId, priceItem.categoryId, priceItem.price]
      );

      rowsInserted += insertResult.rowCount;
    }

    await client.query("COMMIT");

    return {
      rowsInserted
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const releaseExpiredHolds = async (showId, client = pool) => {
  await client.query(
    `
    UPDATE show_seats
    SET
      status = 'AVAILABLE',
      held_by = NULL,
      hold_expires_at = NULL
    WHERE show_id = $1
      AND status = 'HELD'
      AND hold_expires_at <= NOW()
    `,
    [showId]
  );
};

const createHold = async (userId, showId, seatIds) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await releaseExpiredHolds(showId, client);

    const lockResult = await client.query(
      `
  SELECT *
  FROM show_seats
  WHERE show_id = $1
  AND id = ANY($2)
  FOR UPDATE
  `,
      [showId, seatIds]
    );

    if (lockResult.rows.length !== seatIds.length) {
      throw new Error(
        "One or more seats are invalid"
      );
    }

    const unavailableSeat = lockResult.rows.find(
      (seat) => seat.status !== "AVAILABLE"
    );

    if (unavailableSeat) {
      throw new Error(
        `Seat ${unavailableSeat.id} is not available for hold`
      );
    }

    const holdExpiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    const updateResult = await client.query(
      `
      UPDATE show_seats
      SET
        status = 'HELD',
        held_by = $1,
        hold_expires_at = $2
      WHERE id = ANY($3)
      `,
      [userId, holdExpiresAt, seatIds]
    );

    await client.query("COMMIT");

    return {
      seatsHeld: updateResult.rowCount,
      holdExpiresAt
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getShowSeatMap = async (showId) => {
  await releaseExpiredHolds(showId);

  const query = `
SELECT
    ss.id AS show_seat_id,
    s.row_label,
    s.seat_number,
    sc.name AS category_name,
    sc.color,
    sp.price,
    ss.status
FROM show_seats ss

JOIN seats s
ON ss.seat_id = s.id

JOIN seat_categories sc
ON s.category_id = sc.id

LEFT JOIN show_pricing sp
ON sp.show_id = ss.show_id
AND sp.category_id = sc.id

WHERE ss.show_id = $1

ORDER BY
  s.row_label,
  s.seat_number;
  `;

  const result = await pool.query(query, [showId]);

  return result.rows.map((r) => ({
    showSeatId: r.show_seat_id,
    row: r.row_label,
    seat: r.seat_number,
    category: r.category_name,
    color: r.color,
    price: r.price !== null ? Number(r.price) : null,
    status: r.status
  }));
};

module.exports = {
  createShow,
  createShowPricing,
  createHold,
  getShowSeatMap
};
