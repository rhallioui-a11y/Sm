const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db = null;

function getDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    // Use /tmp for Vercel ephemeral storage
    const dbPath = process.env.VERCEL ? '/tmp/database.sqlite' : path.join(__dirname, '../database.sqlite');
    
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(new Error(`Could not connect to DB: ${err.message}`));
      } else {
        console.log('Connected to SQLite database');
        db.run(`CREATE TABLE IF NOT EXISTS students (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT,
          age INTEGER
        )`, (err) => {
          if (err) reject(err);
          else resolve(db);
        });
      }
    });
  });
}

function runQuery(query, params = []) {
  return new Promise(async (resolve, reject) => {
    try {
      const database = await getDatabase();
      database.run(query, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    } catch (error) {
      reject(error);
    }
  });
}

function allQuery(query, params = []) {
  return new Promise(async (resolve, reject) => {
    try {
      const database = await getDatabase();
      database.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    } catch (error) {
      reject(error);
    }
  });
}

function getQuery(query, params = []) {
  return new Promise(async (resolve, reject) => {
    try {
      const database = await getDatabase();
      database.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { getDatabase, runQuery, allQuery, getQuery };
