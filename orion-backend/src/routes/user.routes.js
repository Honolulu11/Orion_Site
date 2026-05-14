const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Временная заглушка (чтобы сервер не падал)
router.get('/', auth, (req, res) => {
  res.json({ message: 'User routes loaded successfully' });
});

module.exports = router;