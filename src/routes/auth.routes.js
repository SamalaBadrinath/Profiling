const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/login/candidate', authController.candidateLogin);
router.post('/login/admin', authController.adminLogin);
router.post('/logout', authController.logout);

module.exports = router;
