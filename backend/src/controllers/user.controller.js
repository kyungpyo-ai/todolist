const userService = require('../services/user.service');

async function getMe(req, res, next) {
  try {
    const user = await userService.getMe(req.userId);
    res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const { name, password, theme, language } = req.body;
    const user = await userService.updateMe(req.userId, { name, password, theme, language });
    res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

async function deleteMe(req, res, next) {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({
        success: false,
        message: '비밀번호를 입력해주세요.',
        code: 'INVALID_INPUT',
      });
    }
    await userService.deleteMe(req.userId, password);
    res.status(200).json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe, updateMe, deleteMe };
