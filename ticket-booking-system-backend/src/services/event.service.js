const pool = require("../config/db");

const createEvent = async (data, organiserId) => {
  const result = await pool.query(
    `
    INSERT INTO events
    (
      organiser_id,
      title,
      description,
      poster_url,
      event_type,
      duration_minutes
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, title
    `,
    [
      organiserId,
      data.title,
      data.description || null,
      data.posterUrl || null,
      data.eventType,
      data.durationMinutes
    ]
  );

  return result.rows[0];
};

const getAllEvents = async () => {
  const result = await pool.query(
    `
    SELECT id, title, event_type
    FROM events
    ORDER BY created_at DESC
    `
  );

  return result.rows;
};

const getEventById = async (eventId) => {
  const eventResult = await pool.query(
    `
    SELECT id, organiser_id, title, description, poster_url, event_type, duration_minutes, created_at
    FROM events
    WHERE id = $1
    `,
    [eventId]
  );

  if (!eventResult.rows.length) {
    return null;
  }

  const showsResult = await pool.query(
    `
    SELECT id, event_id, venue_id, start_time, end_time, status, created_at
    FROM shows
    WHERE event_id = $1
    ORDER BY start_time ASC
    `,
    [eventId]
  );

  return {
    event: eventResult.rows[0],
    shows: showsResult.rows
  };
};

module.exports = {
  createEvent,
  getAllEvents
  ,
  getEventById
};
