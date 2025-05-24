const express = require('express');
const { updateProfile, getProfile } = require('../controllers/profileController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/', authMiddleware, updateProfile);        // ✅ Protected
router.get('/', authMiddleware, getProfile);            // ✅ Protected

module.exports = router;
