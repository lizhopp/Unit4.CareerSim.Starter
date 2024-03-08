const { client,
    createTables,
    createUser,
    createPlace,
    fetchPlaces,
    fetchUsers,
    createVacation,
    destroyVacation } = require('./db');
const express = require('express');
const app = express();
app.use(express.json())

app.get('/api/users', async (req, res, next) => {
    try {
        res.send(await fetchUsers());
    }
    catch (ex) {
        next(ex);
    }
});

app.get('/api/places', async (req, res, next) => {
    try {
        res.send(await fetchPlaces());
    }
    catch (ex) {
        next(ex);
    }
});

app.get('/api/vacations', async (req, res, next) => {
    try {
        res.send(await fetchVacations());
    }
    catch (ex) {
        next(ex);
    }
});

app.delete('/api/vacations/:id', async(req, res, next)=> {
    try {
      await destroyVacation(req.params.id);
      res.sendStatus(204);
    }
    catch(ex){
      next(ex);
    }
  });
  app.post('/api/vacations', async(req, res, next)=> {
    try {
    console.log(req.body)
    
      res.status(201).send(await createVacation(req.body.place_name, req.body.user_name, req.body.departure_date));
    }
    catch(ex){
      next(ex);
    }
  });
         



const init = async () => {
    await client.connect();
    console.log('connected to database');
    await createTables();
    console.log('tables created');
    const [moe, lucy, ethyl, rome, nyc, la, paris] = await Promise.all([
        createUser('moe'),
        createUser('lucy'),
        createUser('ethyl'),
        createPlace('rome'),
        createPlace('nyc'),
        createPlace('la'),
        createPlace('paris')
    ]);
    console.log(`moe has an id of ${moe.id}`);
    console.log(`rome has an id of ${rome.id}`);
}
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port ${port}`));

init()