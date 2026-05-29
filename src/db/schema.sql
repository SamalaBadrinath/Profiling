-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL,
    category TEXT,
    resume_url TEXT,
    role TEXT DEFAULT 'candidate',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert a single default Admin user
INSERT INTO users (
    id, 
    name, 
    email, 
    phone, 
    password_hash, 
    category, 
    resume_url, 
    role, 
    created_at
) VALUES (
    'admin-init-id', 
    'Admin User', 
    'admin@profiling.com', 
    '+10000000000', 
    'admin_password_hash_placeholder', 
    'Administration', 
    NULL, 
    'admin', 
    CURRENT_TIMESTAMP
);
