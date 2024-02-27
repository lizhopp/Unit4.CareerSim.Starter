//users
//Email  PK string varchar not null
//Password  string varchar  not null
//First Name string varchar 
//Last Name string varchar
//Address string varchar   not null
//Payment Info string varchar
//Phone Number string varchar
//Logged In  (boolean)  false
//Admin?  (boolean)  false

// SELECT * FROM users;
// SELECT * FROM users WHERE admin = true;
// SELECT * FROM users WHERE email = 'bob@mail.com';

const pg = require('pg')
const express = require('express')
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/the_acme_notes_db')
const app = express()

app.use(express.json());
app.use(require('morgan')('dev'));

//app routes
app.post('/api/notes', async (req, res, next) => {
    try{
        const SQL = `INSERT INTO notes(txt)
        VALUES ($1)
        RETURNING *`
        const result = await client.query(SQL, [req.body.txt])
        res.send(result.rows[0])

    }catch(error){
        next(error)
    }
});
app.get('/api/notes', async (req, res, next) => {
    try{
        const SQL = `SELECT * from notes ORDER BY ranking ASC;`
        const result = await client.query(SQL)
        res.send(result.rows)

    }catch(error){
        next(error)
    }
});
app.put('/api/notes/:id', async (req, res, next) => {
    try{
        const SQL = `UPDATE notes
        SET txt=$1, ranking=$2, updated_at=now()
        WHERE id=$3 RETURNING *`
        const result = await client.query(SQL, [req.body.txt, req.body.ranking, req.params.id])
        res.send(result.rows[0])

    }catch(error){
        next(error)
    }
});
app.delete('/api/notes/:id', async (req, res, next) => {
    try{
        const SQL = `DELETE FROM notes
        WHERE id=$1`
        const result = await client.query(SQL, [req.params.id])
        res.sendStatus(204)

    }catch(error){
        next(error)
    }
});

const init = async () => {
    await client.connect();
    console.log('connected to database')
    let SQL = `DROP TABLE IF EXISTS notes;
    CREATE TABLE notes(
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    ranking INTEGER DEFAULT 3 NOT NULL,
    txt VARCHAR(255) NOT NULL
    );`
    await client.query(SQL)
    console.log('tables created')
    SQL = ` INSERT INTO notes(txt, ranking) VALUES('learn express', 5);
    INSERT INTO notes(txt, ranking) VALUES('write SQL queries', 4);
    INSERT INTO notes(txt, ranking) VALUES('create routes', 2);`;
    await client.query(SQL);
    console.log('data seeded');

    const port = process.env.PORT || 3000
    app.listen(port, () => console.log(`listening on port ${port}`))
}

init()



