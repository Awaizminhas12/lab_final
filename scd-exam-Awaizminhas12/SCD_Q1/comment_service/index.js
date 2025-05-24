const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();
app.use(express.json());

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const BLOG_SERVICE_URL = process.env.BLOG_SERVICE_URL || 'http://blog-service:3000';

// In-memory database
const comments = {};
let commentId = 1;

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Create a new comment
app.post('/', authenticateToken, async (req, res) => {
    try {
        const { content, blogId } = req.body;
        
        // Verify blog exists
        await axios.get(`${BLOG_SERVICE_URL}/${blogId}`);
        
        const comment = {
            id: commentId++,
            content,
            blogId,
            author: req.user.username,
            createdAt: new Date().toISOString()
        };
        
        comments[comment.id] = comment;
        res.status(201).json(comment);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get comments for a blog
app.get('/blog/:blogId', async (req, res) => {
    try {
        // Verify blog exists
        await axios.get(`${BLOG_SERVICE_URL}/${req.params.blogId}`);
        
        const blogComments = Object.values(comments).filter(
            comment => comment.blogId == req.params.blogId
        );
        res.json(blogComments);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a comment
app.delete('/:id', authenticateToken, (req, res) => {
    const comment = comments[req.params.id];
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    
    if (comment.author !== req.user.username) {
        return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }
    
    delete comments[req.params.id];
    res.status(204).send();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Comment Service running on port ${PORT}`);
});
