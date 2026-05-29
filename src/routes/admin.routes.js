const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyAdminToken } = require('../middlewares/auth.middleware');

router.get('/candidates', verifyAdminToken, adminController.getAllCandidates);

module.exports = router;
