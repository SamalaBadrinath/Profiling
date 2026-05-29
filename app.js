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


const authMiddleware = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return c.json({ error: 'Unauthorized' }, 401);
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET); c.set('user', decoded);
    await next();
  } catch (e) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};

app.get('/admin/candidates', authMiddleware, async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM users WHERE role = 'candidate'").all();
    return c.json({ candidates: results });
  } catch(e) {
    return c.json({ error: e.message }, 500);
  }
});


// --- RESTORED CANDIDATE ROUTES ---

app.post('/candidate/register', async (c) => {
  try {
    const body = await c.req.parseBody();
    const { name, email, phone, category, password, resume } = body;
    
    if (!email || !password) return c.json({ error: 'Email and password required' }, 400);

    let resumeData = null;
    let resumeType = null;
    
    // Cloudflare Worker specific file parsing
    if (resume && typeof resume === 'object' && resume.arrayBuffer) {
      resumeData = await resume.arrayBuffer();
      resumeType = resume.type;
    }

    const db = c.env.DB;
    
    // Auto-migrate schema silently to support BLOB resumes
    try { await db.prepare("ALTER TABLE users ADD COLUMN resume_data BLOB").run(); } catch(e) {}
    try { await db.prepare("ALTER TABLE users ADD COLUMN resume_type TEXT").run(); } catch(e) {}

    const existing = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    if (existing) return c.json({ error: 'Email already exists' }, 400);

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = crypto.randomUUID();
    
    await db.prepare('INSERT INTO users (id, name, email, phone, category, password_hash, role, resume_data, resume_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, name, email, phone, category, hashedPassword, 'candidate', resumeData, resumeType).run();

    return c.json({ message: 'Registration successful' }, 200);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

app.post('/auth/login/candidate', async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) return c.json({ error: 'Email and password required' }, 400);

    const db = c.env.DB;
    const user = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();

    if (!user || user.role !== 'candidate') return c.json({ error: 'Invalid login' }, 401);

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return c.json({ error: 'Invalid login' }, 401);

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    return c.json({ message: 'Login successful', token });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});


app.get('/candidate/profile', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const db = c.env.DB;
    const profile = await db.prepare('SELECT id, name, email, phone, category FROM users WHERE id = ?').bind(user.id).first();
    if(!profile) return c.json({ error: 'Not found' }, 404);
    return c.json(profile);
  } catch(e) { return c.json({ error: e.message }, 500); }
});

app.get('/resume/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;
    const user = await db.prepare('SELECT name, resume_data, resume_type FROM users WHERE id = ?').bind(id).first();
    
    if(!user) return c.text('Not found', 404);
    
    if (!user.resume_data) {
      const content = "Candidate Resume Profile: " + user.name + "\n\nNo file was uploaded or the file was lost before the D1 BLOB migration was applied.";
      return new Response(content, {
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    return new Response(user.resume_data, {
      headers: {
        'Content-Type': user.resume_type || 'application/pdf',
        'Content-Disposition': 'inline; filename="' + user.name.replace(/\s+/g, '_') + '_resume"'
      }
    });
  } catch(e) {
    return c.text('Error: ' + e.message, 500);
  }
});

app.get('/*', serveStatic({ root: './' }));

export default app;
