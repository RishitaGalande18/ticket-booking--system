const pool = require("../config/db");

const createSeats = async (venueId, rows) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const venueResult = await client.query(
      "SELECT id FROM venues WHERE id = $1",
      [venueId]
    );

    if (!venueResult.rows.length) {
      throw new Error("Venue not found");
    }

    for (const rowData of rows) {
      const categoryResult = await client.query(
        "SELECT id FROM seat_categories WHERE id = $1 AND venue_id = $2",
        [rowData.categoryId, venueId]
      );

      if (!categoryResult.rows.length) {
        throw new Error(
          `Category ${rowData.categoryId} does not belong to venue ${venueId}`
        );
      }

      for (
        let seatNumber = 1;
        seatNumber <= rowData.count;
        seatNumber++
      ) {
        await client.query(
          `
          INSERT INTO seats
          (
            venue_id,
            category_id,
            row_label,
            seat_number
          )
          VALUES($1, $2, $3, $4)
          `,
          [venueId, rowData.categoryId, rowData.row, seatNumber]
        );
      }
    }

    await client.query("COMMIT");

    return {
      venueId,
      rowsInserted: rows.reduce(
        (total, row) => total + Number(row.count || 0),
        0
      )
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  createSeats
};