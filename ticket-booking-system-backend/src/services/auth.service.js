const bcrypt = require("bcryptjs");
const pool = require("../config/db");

//Register a new user
const createUser = async (userData) => {
  const {
    name,
    email,
    password,
    phone,
    role
  } = userData;

  const existingUser = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );

  if (existingUser.rows.length) {
    throw new Error(
      "Email already exists"
    );
  }

  const hashedPassword =
    await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
    INSERT INTO users
    (
      name,
      email,
      password_hash,
      phone,
      role
    )
    VALUES($1,$2,$3,$4,$5)
    RETURNING id,name,email,role
    `,
    [
      name,
      email,
      hashedPassword,
      phone || null,
      role || "CUSTOMER"
    ]
  );

  return result.rows[0];
};

//Login a user
const loginUser = async (email, password) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );

  const user = result.rows[0];

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  return user;
};


module.exports = {
  createUser,
  loginUser
};