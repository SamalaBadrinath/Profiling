const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const registerCandidate = async (req, res) => {
  try {
    const { name, email, phone, category, password, resume_url } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Validate that the resume URL points to a PDF, if provided
    if (resume_url && !resume_url.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ error: 'Resume must be a PDF file' });
    }

    const db = req.env.DB;
    
    // Check if the email already exists
    const existingUser = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = crypto.randomUUID();

    await db.prepare(
      'INSERT INTO users (id, name, email, phone, password_hash, category, resume_url, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      id, 
      name, 
      email, 
      phone || null, 
      passwordHash, 
      category || null, 
      resume_url || null, 
      'candidate'
    ).run();

    return res.status(201).json({
      message: 'Candidate registered successfully',
      candidateId: id
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const db = req.env.DB;
    const user = await db.prepare(
      'SELECT id, name, email, phone, category, resume_url, role, created_at FROM users WHERE id = ?'
    ).bind(req.user.id).first();
    
    if (!user) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, category, resume_url } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Validate that the resume URL points to a PDF, if provided
    if (resume_url && !resume_url.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ error: 'Resume must be a PDF file' });
    }

    const db = req.env.DB;
    const userId = req.user.id;

    // Check if the new email is already taken by another user
    const existingUser = await db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').bind(email, userId).first();
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already taken by another account' });
    }

    await db.prepare(
      'UPDATE users SET name = ?, email = ?, phone = ?, category = ?, resume_url = ? WHERE id = ?'
    ).bind(
      name,
      email,
      phone || null,
      category || null,
      resume_url || null,
      userId
    ).run();

    return res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const db = req.env.DB;
    const userId = req.user.id;

    await db.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();
    return res.status(200).json({ message: 'Account permanently deleted' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old password and new password are required' });
    }

    const db = req.env.DB;
    const userId = req.user.id;

    const user = await db.prepare('SELECT password_hash FROM users WHERE id = ?').bind(userId).first();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Incorrect old password' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(newPasswordHash, userId).run();

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerCandidate,
  getProfile,
  updateProfile,
  deleteAccount,
  resetPassword
};
