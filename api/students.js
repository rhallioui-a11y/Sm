const { allQuery, runQuery, getQuery } = require('./db');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Get all students
      const students = await allQuery('SELECT * FROM students');
      res.status(200).json(students);
    } 
    else if (req.method === 'POST') {
      // Create new student
      const { name, email, age } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const result = await runQuery(
        'INSERT INTO students (name, email, age) VALUES (?, ?, ?)',
        [name, email || null, age || null]
      );
      
      res.status(201).json({ 
        id: result.lastID, 
        name, 
        email: email || null, 
        age: age || null 
      });
    } 
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
