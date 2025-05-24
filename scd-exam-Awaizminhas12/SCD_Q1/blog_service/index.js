const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// In-memory database
const blogs = {};
let blogId = 1;

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

// Create a new blog post
app.post('/', authenticateToken, (req, res) => {
    const { title, content } = req.body;
    const blog = {
        id: blogId++,
        title,
        content,
        author: req.user.username,
        createdAt: new Date().toISOString()
    };
    
    blogs[blog.id] = blog;
    res.status(201).json(blog);
});

// Get all blog posts
app.get('/', (req, res) => {
    res.json(Object.values(blogs));
});

// Get a specific blog post
app.get('/:id', (req, res) => {
    const blog = blogs[req.params.id];
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
});

// Delete a blog post
app.delete('/:id', authenticateToken, (req, res) => {
    const blog = blogs[req.params.id];
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    
    if (blog.author !== req.user.username) {
        return res.status(403).json({ error: 'Not authorized to delete this blog' });
    }
    
    delete blogs[req.params.id];
    res.status(204).send();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Blog Service running on port ${PORT}`);
});
