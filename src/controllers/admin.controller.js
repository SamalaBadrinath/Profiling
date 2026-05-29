const getAllCandidates = async (req, res) => {
  try {
    const db = req.env.DB;
    
    // Select all candidates from the D1 SQLite database
    const { results } = await db.prepare(
      "SELECT id, name, email, phone, category, resume_url, role, created_at FROM users WHERE role = 'candidate'"
    ).all();
    
    return res.status(200).json(results || []);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllCandidates
};
