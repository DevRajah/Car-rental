const express = require('express');
const form = require('../controllers/formController');
const router = express.Router();
const { authenticate } = require("../middlewares/authentication");

router.post('/billing-form', authenticate, form);

module.exports = router;