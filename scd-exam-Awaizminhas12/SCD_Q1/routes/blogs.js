const express = require('express');
const { createBlog, getBlogs, incrementViews } = require('../controllers/blogController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/', authMiddleware, createBlog);           // ✅ Protected
router.get('/', getBlogs);                              // ❌ Public
router.post('/view/:blogId', incrementViews);           // ❌ Public

module.exports = router;
