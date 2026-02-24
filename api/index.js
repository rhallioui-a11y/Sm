const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  try {
    // Serve index.html for root path
    const filePath = path.join(__dirname, '../public/index.html');
    const content = fs.readFileSync(filePath, 'utf8');
    
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(content);
  } catch (error) {
    res.status(500).json({ error: 'Could not serve index.html' });
  }
};
