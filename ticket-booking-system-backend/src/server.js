require("dotenv").config();

const express = require("express");
const pool = require("./config/db");

const app = require("./app");

app.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT NOW()"
    );

    res.json({
      success: true,
      serverTime: result.rows[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log(
    `Server running on port ${process.env.PORT}`
  );
});