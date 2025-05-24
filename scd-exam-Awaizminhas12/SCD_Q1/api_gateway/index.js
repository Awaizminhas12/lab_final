const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

// Proxy configuration
const services = {
    '/auth': 'http://auth-service:3000',
    '/blogs': 'http://blog-service:3000',
    '/comments': 'http://comment-service:3000',
    '/profiles': 'http://profile-service:3000'
};

// Set up proxy for each service
Object.entries(services).forEach(([route, target]) => {
    app.use(route, createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: {
            [`^${route}`]: ''
        }
    }));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', services: Object.keys(services) });
});

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
