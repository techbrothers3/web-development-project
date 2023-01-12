const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const placesRoutes = require('./routes/places-routes');

const usersRoutes = require('./routes/users-routes');

const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json());

app.use('/api/places', placesRoutes);

app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route', 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message } || 'An Unknown Error Occurred!');
});
// app.use('/api/users', usersRoutes);
mongoose.connect('mongodb://localhost:27017,localhost:27018,localhost:27019?replicaSet=rs')
  .then(() => {
    console.log('connected');
    app.listen(4000);
  })
  .catch((err) => {
    console.log(err);
  });
