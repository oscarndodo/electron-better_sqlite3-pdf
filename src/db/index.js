const Database = require("better-sqlite3")

const db = new Database("app.db")

db.prepare(`
    CREATE TABLE IF NOT EXISTS log_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        path TEXT NOT NULL,
        pages INTEGER NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run()


//INSERT

function insert(valuesArray) {
  const query = db.prepare(`
    INSERT INTO log_files (name, type, path, pages)
    VALUES (?, ?, ?, ?)
  `);

  const result = query.run(valuesArray) 
  return result.lastInsertRowid
}


// SELECT

function select() {
    const query = db.prepare("SELECT * FROM log_files ORDER BY id DESC")
    const result= query.all()
    return result
}

module.exports = {
    insert,
    select
}