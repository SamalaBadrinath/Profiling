const express = require('express');
const serverless = require('serverless-http');

const authRoutes = require('./src/routes/auth.routes');
const candidateRoutes = require('./src/routes/candidate.routes');
const adminRoutes = require('./src/routes/admin.routes');

const app = express();

// Parse request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Middleware to inject Cloudflare Env into request
app.use((req, res, next) => {
  req.env = req.env || {};
  if (req.apiGateway && req.apiGateway.context) {
    req.env = req.apiGateway.context.env || {};
  }
  next();
});

// Decoupled Router Mounting
app.use('/auth', authRoutes);
app.use('/candidate', candidateRoutes);
app.use('/admin', adminRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const handler = serverless(app);

// Cloudflare Worker Fetch handler entrypoint (ES Module format for Wrangler compatibility)
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const event = {
      httpMethod: request.method,
      path: url.pathname,
      queryStringParameters: Object.fromEntries(url.searchParams),
      headers: Object.fromEntries([...request.headers]),
      body: ['POST', 'PUT', 'PATCH'].includes(request.method) ? await request.text() : null,
      isBase64Encoded: false
    };
    return handler(event, { ...ctx, env });
  }
};
