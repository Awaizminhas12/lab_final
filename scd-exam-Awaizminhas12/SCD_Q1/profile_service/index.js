const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// In-memory database
const profiles = {};

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

// Create or update profile
app.post('/', authenticateToken, (req, res) => {
    const { bio, website, location } = req.body;
    
    const profile = {
        userId: req.user.userId,
        username: req.user.username,
        bio,
        website,
        location,
        updatedAt: new Date().toISOString()
    };
    
    profiles[req.user.userId] = profile;
    res.status(201).json(profile);
});

// Get current user's profile
app.get('/me', authenticateToken, (req, res) => {
    const profile = profiles[req.user.userId];
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
});

// Get profile by username
app.get('/:username', (req, res) => {
    const profile = Object.values(profiles).find(
        p => p.username === req.params.username
    );
    
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Profile Service running on port ${PORT}`);
});
