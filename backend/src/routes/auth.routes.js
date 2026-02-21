const router = require("express").Router();
const { body } = require("express-validator");
const { validate } = require("../middlewares/validate");
const auth = require("../controllers/auth.controller");

router.post(
  "/register",
  [
    body("name").isString().isLength({ min: 2, max: 50 }),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  validate,
  auth.register
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").isString().isLength({ min: 1 })],
  validate,
  auth.login
);

module.exports = router;
