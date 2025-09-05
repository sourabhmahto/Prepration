require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Fixed admin credentials
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'InterviewPrep2024!';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Database setup - Use SQLite for local development, PostgreSQL/MySQL for production
let db;
const USE_SQLITE = process.env.USE_SQLITE === 'true';
const DATABASE_URL = process.env.DATABASE_URL;

if (USE_SQLITE) {
    const sqlite3 = require('sqlite3').verbose();
    db = new sqlite3.Database('interview_prep.db');
    console.log('Using SQLite database');
} else if (DATABASE_URL) {
    // PostgreSQL for Render.com
    const { Pool } = require('pg');
    db = new Pool({
        connectionString: DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    console.log('Using PostgreSQL database');
} else {
    // MySQL fallback
    const mysql = require('mysql2/promise');
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'interview_prep',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };
    db = mysql.createPool(dbConfig);
    console.log('Using MySQL database');
}

// Initialize Database Tables
async function initializeDatabase() {
    if (USE_SQLITE) {
        // SQLite initialization
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT NOT NULL,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                why_purpose TEXT,
                where_usage TEXT,
                example TEXT,
                faq TEXT,
                difficulty TEXT DEFAULT 'medium',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
            
            // Check if we need to add sample data
            db.get("SELECT COUNT(*) as count FROM questions", (err, row) => {
                if (err) {
                    console.error('Error checking questions count:', err);
                    return;
                }
                
                if (row.count === 0) {
                    console.log('Adding sample questions to SQLite...');
                    insertSampleQuestionsSQLite();
                }
            });
        });
    } else if (DATABASE_URL) {
        // PostgreSQL initialization
        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS questions (
                    id SERIAL PRIMARY KEY,
                    category VARCHAR(100) NOT NULL,
                    question TEXT NOT NULL,
                    answer TEXT NOT NULL,
                    why_purpose TEXT,
                    where_usage TEXT,
                    example TEXT,
                    faq TEXT,
                    difficulty VARCHAR(20) DEFAULT 'medium',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            console.log('PostgreSQL tables initialized');
            
            // Check if we need to add sample data
            await insertSampleQuestionsPostgreSQL();
            
        } catch (error) {
            console.error('PostgreSQL initialization error:', error);
        }
    } else {
        // MySQL initialization
        try {
            const connection = await db.getConnection();
            
            // Create questions table
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS questions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    category VARCHAR(100) NOT NULL,
                    question TEXT NOT NULL,
                    answer TEXT NOT NULL,
                    why_purpose TEXT,
                    where_usage TEXT,
                    example TEXT,
                    faq TEXT,
                    difficulty VARCHAR(20) DEFAULT 'medium',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            connection.release();
            
            // Check if we need to add sample data
            await insertSampleQuestionsMySQL();
            
        } catch (error) {
            console.error('Database initialization error:', error);
        }
    }
}

// Insert sample questions for SQLite
function insertSampleQuestionsSQLite() {
    db.get("SELECT COUNT(*) as count FROM questions", (err, row) => {
        if (err || row.count > 0) return; // Skip if error or questions exist
        
        const sampleQuestions = [
            ['JavaScript', 'What is the difference between let, const, and var?', 
             'let and const are block-scoped, while var is function-scoped. const cannot be reassigned after declaration, let can be reassigned, and var can be both reassigned and redeclared.',
             'This tests understanding of variable scoping and declaration differences, which is fundamental for avoiding bugs and writing maintainable code.',
             'Used in all JavaScript applications, especially important in loops, conditional blocks, and when preventing accidental variable redeclaration.',
             'var x = 1; if(true) { var x = 2; } // x is 2 outside\nlet y = 1; if(true) { let y = 2; } // y is still 1 outside',
             'Q: Can you redeclare let? A: No, it throws SyntaxError. Q: What happens with const objects? A: Object properties can be modified, but reference cannot be reassigned.',
             'medium'],
            
            ['JavaScript', 'Explain closures in JavaScript', 
             'A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned. It gives you access to an outer function\'s scope from an inner function.',
             'Closures are essential for data privacy, creating factory functions, and understanding how JavaScript handles scope and memory.',
             'Used in module patterns, event handlers, callbacks, and any scenario where you need to maintain state between function calls.',
             'function outer(x) { return function inner(y) { return x + y; }; } const add5 = outer(5); console.log(add5(10)); // 15',
             'Q: Do closures cause memory leaks? A: They can if not handled properly. Q: Can inner function modify outer variables? A: Yes, if they are not const.',
             'medium'],
             
            ['.NET', 'What is the difference between .NET Framework and .NET Core?', 
             '.NET Framework is Windows-only and monolithic, while .NET Core (now .NET 5+) is cross-platform, open-source, and modular. .NET Core has better performance and is the future of .NET.',
             'Understanding the evolution and differences helps in choosing the right platform for new projects and migration strategies.',
             'Used when deciding technology stack for new applications, containerization, cloud deployment, and cross-platform development.',
             '.NET Framework: Windows-only, full framework. .NET Core/.NET 5+: Linux, macOS, Windows support with Docker containers.',
             'Q: Can I run .NET Framework on Linux? A: No, only with Mono. Q: Is .NET Core backward compatible? A: Mostly, but some APIs are not available.',
             'medium'],
             
            ['SQL Server', 'What is the difference between INNER JOIN and LEFT JOIN?', 
             'INNER JOIN returns only matching records from both tables. LEFT JOIN returns all records from the left table and matching records from the right table, with NULL for non-matching right table records.',
             'JOIN operations are fundamental for relational database queries and understanding data relationships.',
             'Used in reporting, data analysis, and any scenario where you need to combine data from multiple related tables.',
             'SELECT * FROM Users u INNER JOIN Orders o ON u.id = o.user_id; -- Only users with orders\nSELECT * FROM Users u LEFT JOIN Orders o ON u.id = o.user_id; -- All users, orders if exist',
             'Q: What about RIGHT JOIN? A: Returns all records from right table. Q: Performance difference? A: INNER JOIN is typically faster as it returns fewer records.',
             'easy']
        ];

        const stmt = db.prepare("INSERT INTO questions (category, question, answer, why_purpose, where_usage, example, faq, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        sampleQuestions.forEach(q => stmt.run(q));
        stmt.finalize();
        console.log('Sample questions inserted successfully (SQLite)');
    });
}

// Insert sample questions for MySQL
async function insertSampleQuestionsMySQL() {
    try {
        const connection = await db.getConnection();
        
        const [existing] = await connection.execute('SELECT COUNT(*) as count FROM questions');
        if (existing[0].count > 0) {
            connection.release();
            return;
        }

        const sampleQuestions = [
            ['JavaScript', 'What is the difference between let, const, and var?', 
             'let and const are block-scoped, while var is function-scoped. const cannot be reassigned after declaration, let can be reassigned, and var can be both reassigned and redeclared.',
             'This tests understanding of variable scoping and declaration differences, which is fundamental for avoiding bugs and writing maintainable code.',
             'Used in all JavaScript applications, especially important in loops, conditional blocks, and when preventing accidental variable redeclaration.',
             'var x = 1; if(true) { var x = 2; } // x is 2 outside\nlet y = 1; if(true) { let y = 2; } // y is still 1 outside',
             'Q: Can you redeclare let? A: No, it throws SyntaxError. Q: What happens with const objects? A: Object properties can be modified, but reference cannot be reassigned.',
             'medium'],
            
            ['JavaScript', 'Explain closures in JavaScript', 
             'A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned. It gives you access to an outer function\'s scope from an inner function.',
             'Closures are essential for data privacy, creating factory functions, and understanding how JavaScript handles scope and memory.',
             'Used in module patterns, event handlers, callbacks, and any scenario where you need to maintain state between function calls.',
             'function outer(x) { return function inner(y) { return x + y; }; } const add5 = outer(5); console.log(add5(10)); // 15',
             'Q: Do closures cause memory leaks? A: They can if not handled properly. Q: Can inner function modify outer variables? A: Yes, if they are not const.',
             'medium'],
             
            ['.NET', 'What is the difference between .NET Framework and .NET Core?', 
             '.NET Framework is Windows-only and monolithic, while .NET Core (now .NET 5+) is cross-platform, open-source, and modular. .NET Core has better performance and is the future of .NET.',
             'Understanding the evolution and differences helps in choosing the right platform for new projects and migration strategies.',
             'Used when deciding technology stack for new applications, containerization, cloud deployment, and cross-platform development.',
             '.NET Framework: Windows-only, full framework. .NET Core/.NET 5+: Linux, macOS, Windows support with Docker containers.',
             'Q: Can I run .NET Framework on Linux? A: No, only with Mono. Q: Is .NET Core backward compatible? A: Mostly, but some APIs are not available.',
             'medium'],
             
            ['SQL Server', 'What is the difference between INNER JOIN and LEFT JOIN?', 
             'INNER JOIN returns only matching records from both tables. LEFT JOIN returns all records from the left table and matching records from the right table, with NULL for non-matching right table records.',
             'JOIN operations are fundamental for relational database queries and understanding data relationships.',
             'Used in reporting, data analysis, and any scenario where you need to combine data from multiple related tables.',
             'SELECT * FROM Users u INNER JOIN Orders o ON u.id = o.user_id; -- Only users with orders\nSELECT * FROM Users u LEFT JOIN Orders o ON u.id = o.user_id; -- All users, orders if exist',
             'Q: What about RIGHT JOIN? A: Returns all records from right table. Q: Performance difference? A: INNER JOIN is typically faster as it returns fewer records.',
             'easy']
        ];

        for (const question of sampleQuestions) {
            await connection.execute(
                'INSERT INTO questions (category, question, answer, why_purpose, where_usage, example, faq, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                question
            );
        }
        
        connection.release();
        console.log('Sample questions inserted successfully (MySQL)');
        connection.release();
    } catch (error) {
        console.error('Error inserting sample questions (MySQL):', error);
    }
}

// Insert sample questions for PostgreSQL
async function insertSampleQuestionsPostgreSQL() {
    try {
        const result = await db.query('SELECT COUNT(*) as count FROM questions');
        if (result.rows[0].count > 0) {
            return;
        }

        const sampleQuestions = [
            ['JavaScript', 'What is the difference between let, const, and var?', 
             'let and const are block-scoped, while var is function-scoped. const cannot be reassigned after declaration, let can be reassigned, and var can be both reassigned and redeclared.',
             'This tests understanding of variable scoping and declaration differences, which is fundamental for avoiding bugs and writing maintainable code.',
             'Used in all JavaScript applications, especially important in loops, conditional blocks, and when preventing accidental variable redeclaration.',
             'var x = 1; if(true) { var x = 2; } // x is 2 outside\nlet y = 1; if(true) { let y = 2; } // y is still 1 outside',
             'Q: Can you redeclare let? A: No, it throws SyntaxError. Q: What happens with const objects? A: Object properties can be modified, but reference cannot be reassigned.',
             'medium'],
            
            ['JavaScript', 'Explain closures in JavaScript', 
             'A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned. It gives you access to an outer function\'s scope from an inner function.',
             'Closures are essential for data privacy, creating factory functions, and understanding how JavaScript handles scope and memory.',
             'Used in module patterns, event handlers, callbacks, and any scenario where you need to maintain state between function calls.',
             'function outer(x) { return function inner(y) { return x + y; }; } const add5 = outer(5); console.log(add5(10)); // 15',
             'Q: Do closures cause memory leaks? A: They can if not handled properly. Q: Can inner function modify outer variables? A: Yes, if they are not const.',
             'medium'],
             
            ['.NET', 'What is the difference between .NET Framework and .NET Core?', 
             '.NET Framework is Windows-only and monolithic, while .NET Core (now .NET 5+) is cross-platform, open-source, and modular. .NET Core has better performance and is the future of .NET.',
             'Understanding the evolution and differences helps in choosing the right platform for new projects and migration strategies.',
             'Used when deciding technology stack for new applications, containerization, cloud deployment, and cross-platform development.',
             '.NET Framework: Windows-only, full framework. .NET Core/.NET 5+: Linux, macOS, Windows support with Docker containers.',
             'Q: Can I run .NET Framework on Linux? A: No, only with Mono. Q: Is .NET Core backward compatible? A: Mostly, but some APIs are not available.',
             'medium'],
             
            ['SQL Server', 'What is the difference between INNER JOIN and LEFT JOIN?', 
             'INNER JOIN returns only matching records from both tables. LEFT JOIN returns all records from the left table and matching records from the right table, with NULL for non-matching right table records.',
             'JOIN operations are fundamental for relational database queries and understanding data relationships.',
             'Used in reporting, data analysis, and any scenario where you need to combine data from multiple related tables.',
             'SELECT * FROM Users u INNER JOIN Orders o ON u.id = o.user_id; -- Only users with orders\nSELECT * FROM Users u LEFT JOIN Orders o ON u.id = o.user_id; -- All users, orders if exist',
             'Q: What about RIGHT JOIN? A: Returns all records from right table. Q: Performance difference? A: INNER JOIN is typically faster as it returns fewer records.',
             'easy']
        ];

        for (const question of sampleQuestions) {
            await db.query(
                'INSERT INTO questions (category, question, answer, why_purpose, where_usage, example, faq, difficulty) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                question
            );
        }
        
        console.log('Sample questions inserted successfully (PostgreSQL)');
    } catch (error) {
        console.error('Error inserting sample questions (PostgreSQL):', error);
    }
}

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Routes

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fixed admin login (no registration)
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    try {
        // Check against fixed admin credentials
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            const token = jwt.sign({ id: 1, username: ADMIN_USERNAME }, JWT_SECRET, { expiresIn: '24h' });
            res.json({ message: 'Login successful', token, username: ADMIN_USERNAME });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get questions by category
app.get('/api/questions/:category', authenticateToken, async (req, res) => {
    const { category } = req.params;
    
    if (USE_SQLITE) {
        db.all("SELECT * FROM questions WHERE category = ? ORDER BY created_at DESC", 
            [category], 
            (err, questions) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to fetch questions' });
                }
                res.json(questions);
            }
        );
    } else if (DATABASE_URL) {
        try {
            const result = await db.query(
                'SELECT * FROM questions WHERE category = $1 ORDER BY created_at DESC',
                [category]
            );
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch questions' });
        }
    } else {
        try {
            const connection = await db.getConnection();
            const [questions] = await connection.execute(
                'SELECT * FROM questions WHERE category = ? ORDER BY created_at DESC',
                [category]
            );
            connection.release();
            res.json(questions);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch questions' });
        }
    }
});

// Get all categories
app.get('/api/categories', authenticateToken, async (req, res) => {
    if (USE_SQLITE) {
        db.all("SELECT DISTINCT category FROM questions ORDER BY category", (err, categories) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to fetch categories' });
            }
            res.json(categories.map(c => c.category));
        });
    } else if (DATABASE_URL) {
        try {
            const result = await db.query('SELECT DISTINCT category FROM questions ORDER BY category');
            res.json(result.rows.map(c => c.category));
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch categories' });
        }
    } else {
        try {
            const connection = await db.getConnection();
            const [categories] = await connection.execute('SELECT DISTINCT category FROM questions ORDER BY category');
            connection.release();
            res.json(categories.map(c => c.category));
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch categories' });
        }
});

// Add new question
app.post('/api/questions', authenticateToken, async (req, res) => {
    console.log('Add question API called with data:', req.body);
    
    const { category, question, answer, why_purpose, where_usage, example, faq, difficulty = 'medium' } = req.body;

    if (!category || !question || !answer) {
        console.log('Validation failed:', { category: !!category, question: !!question, answer: !!answer });
        return res.status(400).json({ error: 'Category, question, and answer are required' });
    }

    if (USE_SQLITE) {
        db.run("INSERT INTO questions (category, question, answer, why_purpose, where_usage, example, faq, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [category, question, answer, why_purpose, where_usage, example, faq, difficulty],
            function(err) {
                if (err) {
                    console.error('SQLite insert error:', err);
                    return res.status(500).json({ error: 'Failed to add question' });
                }
                console.log('Question added successfully with ID:', this.lastID);
                res.json({ message: 'Question added successfully', id: this.lastID });
            }
        );
    } else if (DATABASE_URL) {
        try {
            const result = await db.query(
                'INSERT INTO questions (category, question, answer, why_purpose, where_usage, example, faq, difficulty) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
                [category, question, answer, why_purpose, where_usage, example, faq, difficulty]
            );
            console.log('Question added successfully with ID:', result.rows[0].id);
            res.json({ message: 'Question added successfully', id: result.rows[0].id });
        } catch (error) {
            console.error('PostgreSQL insert error:', error);
            res.status(500).json({ error: 'Failed to add question' });
        }
    } else {
        try {
            const connection = await db.getConnection();
            const [result] = await connection.execute(
                'INSERT INTO questions (category, question, answer, why_purpose, where_usage, example, faq, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [category, question, answer, why_purpose, where_usage, example, faq, difficulty]
            );
            connection.release();
            console.log('Question added successfully with ID:', result.insertId);
            res.json({ message: 'Question added successfully', id: result.insertId });
        } catch (error) {
            console.error('MySQL insert error:', error);
            res.status(500).json({ error: 'Failed to add question' });
        }
    }
});

// Update question
app.put('/api/questions/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { category, question, answer, why_purpose, where_usage, example, faq, difficulty } = req.body;

    if (USE_SQLITE) {
        db.run("UPDATE questions SET category = ?, question = ?, answer = ?, why_purpose = ?, where_usage = ?, example = ?, faq = ?, difficulty = ? WHERE id = ?",
            [category, question, answer, why_purpose, where_usage, example, faq, difficulty, id],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Failed to update question' });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ error: 'Question not found' });
                }
                res.json({ message: 'Question updated successfully' });
            }
        );
    } else {
        try {
            const connection = await db.getConnection();
            const [result] = await connection.execute(
                'UPDATE questions SET category = ?, question = ?, answer = ?, why_purpose = ?, where_usage = ?, example = ?, faq = ?, difficulty = ? WHERE id = ?',
                [category, question, answer, why_purpose, where_usage, example, faq, difficulty, id]
            );
            connection.release();
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Question not found' });
            }
            res.json({ message: 'Question updated successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update question' });
        }
    }
});

// Delete question
app.delete('/api/questions/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    if (USE_SQLITE) {
        db.run("DELETE FROM questions WHERE id = ?", [id], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to delete question' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Question not found' });
            }
            res.json({ message: 'Question deleted successfully' });
        });
    } else {
        try {
            const connection = await db.getConnection();
            const [result] = await connection.execute('DELETE FROM questions WHERE id = ?', [id]);
            connection.release();
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Question not found' });
            }
            res.json({ message: 'Question deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete question' });
        }
    }
});

// Search questions
app.get('/api/search', authenticateToken, async (req, res) => {
    const { q } = req.query;
    
    if (!q) {
        return res.status(400).json({ error: 'Search query required' });
    }

    if (USE_SQLITE) {
        db.all("SELECT * FROM questions WHERE question LIKE ? OR answer LIKE ? OR why_purpose LIKE ? OR where_usage LIKE ? OR example LIKE ? OR faq LIKE ? ORDER BY created_at DESC",
            [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`],
            (err, questions) => {
                if (err) {
                    return res.status(500).json({ error: 'Search failed' });
                }
                res.json(questions);
            }
        );
    } else {
        try {
            const connection = await db.getConnection();
            const [questions] = await connection.execute(
                'SELECT * FROM questions WHERE question LIKE ? OR answer LIKE ? OR why_purpose LIKE ? OR where_usage LIKE ? OR example LIKE ? OR faq LIKE ? ORDER BY created_at DESC',
                [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`]
            );
            connection.release();
            res.json(questions);
        } catch (error) {
            res.status(500).json({ error: 'Search failed' });
        }
    }
});

// Initialize database and start server
initializeDatabase();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Using ${USE_SQLITE ? 'SQLite' : 'MySQL'} database`);
    console.log(`Admin credentials: ${ADMIN_USERNAME} / ${ADMIN_PASSWORD}`);
});
