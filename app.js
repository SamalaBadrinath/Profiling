import { Hono } from 'hono';
import { serveStatic } from 'hono/cloudflare-workers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = new Hono();

const JWT_SECRET = 'fallback-secret-for-dev';

app.post('/auth/login/admin', async (c) => {
  try {
    const { email, password } = await c.req.json();
    const targetEmail = email || 'admin@profiling.com';
    if (!password) return c.json({ error: 'Password required' }, 400);

    const db = c.env.DB;
    const user = await db.prepare('SELECT * FROM users WHERE email = ?').bind(targetEmail).first();

    if (!user || user.role !== 'admin') return c.json({ error: 'Invalid login' }, 401);

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return c.json({ error: 'Invalid login' }, 401);

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    return c.json({ message: 'Login successful', token });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

app.get('/*', serveStatic({ root: './' }));

export default app;
