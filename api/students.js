const { allQuery, runQuery, getQuery } = require('./db');

// Parse JSON body
async function parseBody(req) {
  if (req.body) return req.body;
  
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

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
      console.log('GET /students - Retrieved', students.length, 'students');
      res.status(200).json(students);
    } 
    else if (req.method === 'POST') {
      // Create new student
      const body = await parseBody(req);
      const { name, email, age } = body;
      
      console.log('POST /students - Received:', { name, email, age });
      
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const result = await runQuery(
        'INSERT INTO students (name, email, age) VALUES (?, ?, ?)',
        [name, email || null, age || null]
      );
      
      console.log('POST /students - Created student with ID:', result.lastID);
      
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
    console.error('ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};
