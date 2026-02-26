const { getQuery, runQuery } = require('../db');

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
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }

    if (req.method === 'GET') {
      // Get student by ID
      const student = await getQuery('SELECT * FROM students WHERE id = ?', [id]);
      
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      
      console.log('GET /students/:id - Retrieved student:', student);
      res.status(200).json(student);
    } 
    else if (req.method === 'PUT') {
      // Update student
      const body = await parseBody(req);
      const { name, email, age } = body;

      console.log('PUT /students/:id - Updating student:', id, { name, email, age });

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const result = await runQuery(
        'UPDATE students SET name = ?, email = ?, age = ? WHERE id = ?',
        [name, email || null, age || null, id]
      );

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }

      console.log('PUT /students/:id - Updated successfully');
      res.status(200).json({ id: parseInt(id), name, email: email || null, age: age || null });
    } 
    else if (req.method === 'DELETE') {
      // Delete student
      console.log('DELETE /students/:id - Deleting student:', id);
      
      const result = await runQuery('DELETE FROM students WHERE id = ?', [id]);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }

      console.log('DELETE /students/:id - Deleted successfully');
      res.status(200).json({ deleted: id });
    } 
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};
