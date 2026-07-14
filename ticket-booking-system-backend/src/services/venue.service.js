const pool =
  require("../config/db");

const createVenue = async (
  data,
  adminId
) => {

  const result =
    await pool.query(
      `
      INSERT INTO venues
      (
        name,
        city,
        address,
        created_by
      )
      VALUES ($1,$2,$3,$4)
      RETURNING *
      `,
      [
        data.name,
        data.city,
        data.address,
        adminId
      ]
    );

  return result.rows[0];
};

const getVenueLayout = async (venueId) => {
  const result = await pool.query(
    `
    SELECT
      s.id,
      s.row_label,
      s.seat_number,
      sc.name AS category_name,
      sc.color
    FROM seats s
    JOIN seat_categories sc
      ON sc.id = s.category_id
    WHERE s.venue_id = $1
    ORDER BY
      s.row_label,
      s.seat_number
    `,
    [venueId]
  );

  return result.rows;
};

module.exports = {
  createVenue,
  getVenueLayout
};