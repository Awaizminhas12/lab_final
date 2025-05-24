const express = require('express');
const { addComment, getComments } = require('../controllers/commentController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/', authMiddleware, addComment);           // ✅ Protected
router.get('/:blogId', getComments);                    // ❌ Public

module.exports = router;
