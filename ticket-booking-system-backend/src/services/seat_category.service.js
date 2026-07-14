const pool = require("../config/db");

const createSeatCategory = async (
  venueId,
  name,
  color
) => {

  const venueCheck = await pool.query(
  `SELECT id FROM venues WHERE id=$1`,
  [venueId]
);

if (!venueCheck.rows.length) {
  throw new Error("Venue not found");
}

  const result = await pool.query(
    `
    INSERT INTO seat_categories
    (
      venue_id,
      name,
      color
    )
    VALUES($1,$2,$3)
    RETURNING *
    `,
    [
      venueId,
      name,
      color
    ]
  );

  return result.rows[0];
};

module.exports = {
  createSeatCategory
};