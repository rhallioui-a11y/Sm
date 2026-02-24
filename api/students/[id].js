const { getQuery, runQuery } = require('../db');

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
      
      res.status(200).json(student);
    } 
    else if (req.method === 'PUT') {
      // Update student
      const { name, email, age } = req.body;

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

      res.status(200).json({ id: parseInt(id), name, email: email || null, age: age || null });
    } 
    else if (req.method === 'DELETE') {
      // Delete student
      const result = await runQuery('DELETE FROM students WHERE id = ?', [id]);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }

      res.status(200).json({ deleted: id });
    } 
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
