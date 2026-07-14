const {
  registerSchema
} = require("../validators/auth.validator");

const {
  createUser
} = require("../services/auth.service");

const {
  loginSchema
} = require("../validators/auth.validator");

const {
  loginUser
} = require("../services/auth.service");

const {
  generateToken
} = require("../utils/jwt");

const register = async (
  req,
  res
) => {
  try {
    const validated =
      registerSchema.parse(req.body);

    const user =
      await createUser(validated);

    res.status(201).json({
      success: true,
      message:
        "User registered successfully",
      user
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message
    });

  }
};

const login = async (req, res) => {
  try {
    const validated =
      loginSchema.parse(req.body);

    const user = await loginUser(
      validated.email,
      validated.password
    );

    const token =
      generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    res.status(401).json({
      success: false,
      message: error.message
    });

  }
};

const me = async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

module.exports = {
  register,
  login,
  me
};