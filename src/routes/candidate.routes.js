const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidate.controller');
const { verifyCandidateToken } = require('../middlewares/auth.middleware');

router.post('/register', candidateController.registerCandidate);
router.get('/profile', verifyCandidateToken, candidateController.getProfile);
router.post('/profile/update', verifyCandidateToken, candidateController.updateProfile);
router.post('/profile/delete', verifyCandidateToken, candidateController.deleteAccount);
router.post('/profile/reset-password', verifyCandidateToken, candidateController.resetPassword);

module.exports = router;
