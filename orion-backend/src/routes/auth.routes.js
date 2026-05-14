const express = require('express');
const Joi = require('joi'); 
const authController = require('../controllers/auth.controller');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Валидация данных перед регистрацией
const validateRegistration = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    userType: Joi.string().valid('PRIVATE', 'BUSINESS').default('PRIVATE')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

// POST /api/auth/register
router.post('/register', validateRegistration, authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/me (защищённый)
router.get('/me', auth, authController.getProfile);

module.exports = router;