const pg = require('pg')
const express = require('express')
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_notes_categories_db')
const app = express()

app.use(express.json());
app.use(require('morgan')('dev'));

app.get('/api/categories', async (req, res, next) => {
    try {
        const SQL = `
      SELECT * from categories
    `
        const response = await client.query(SQL)
        res.send(response.rows)
    } catch (ex) { 
        next(ex) 
    }
})

app.get('/api/notes', async (req, res, next) => {
    try {
      const SQL = `
        SELECT * from notes ORDER BY created_at DESC;
      `
      const response = await client.query(SQL)
      res.send(response.rows)
    } catch (ex) {
      next(ex)
    }
  })

app.put('/api/notes/:id', async (req, res, next) => {
    try {
      const SQL = `
        UPDATE notes
        SET txt=$1, ranking=$2, category_id=$3, updated_at= now()
        WHERE id=$4 RETURNING *
      `
      console.log(req.body)
      const response = await client.query(SQL, [
        req.body.txt,
        req.body.ranking,
        req.body.category_id,
        req.params.id
      ])
      res.send(response.rows[0])
    } catch (ex) {
      next(ex)
    }
  })

async function init() {
    await client.connect()
    let SQL = `
    DROP TABLE IF EXISTS notes;
    DROP TABLE IF EXISTS categories;
    CREATE TABLE categories(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL);
    
    CREATE TABLE notes(
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    ranking INTEGER DEFAULT 3 NOT NULL,
    txt VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES categories(id) NOT NULL);
    
    INSERT INTO categories(name) VALUES('SQL');
    INSERT INTO categories(name) VALUES('Express');
    INSERT INTO categories(name) VALUES('Shopping');
    INSERT INTO notes(txt, ranking, category_id) VALUES('learn express', 5, (SELECT id FROM categories WHERE name='Express'));
    INSERT INTO notes(txt, ranking, category_id) VALUES('add logging middleware', 5, (SELECT id FROM categories WHERE name='Express'));
    INSERT INTO notes(txt, ranking, category_id) VALUES('write SQL queries', 4, (SELECT id FROM categories WHERE name='SQL'));
    INSERT INTO notes(txt, ranking, category_id) VALUES('learn about foreign keys', 4, (SELECT id FROM categories WHERE name='SQL'));
    INSERT INTO notes(txt, ranking, category_id) VALUES('buy a quart of milk', 2, (SELECT id FROM categories WHERE name='Shopping'));`

    await client.query(SQL);
    const port = process.env.PORT || 3000
    app.listen(port, () => console.log(`listening on port ${port}`))

}



init()