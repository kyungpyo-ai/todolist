const authService = require('../services/auth.service');

async function signup(req, res, next) {
  try {
    const { email, password, name } = req.body;
    const user = await authService.signup({ email, password, name });
    res.status(201).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.login({ email, password });
    res.status(200).json({ success: true, data: { token, user } });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login };
