const { v4: uuid } = require('uuid');

const { validationResult } = require('express-validator');

const User = require('../models/user');

const HttpError = require('../models/http-error');

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');
  } catch (err) {
    const error = new HttpError('Fetching users failed, please try again later', 500);
    return next(error);
  }

  res.status(200).json({ users: users.map((user) => user.toObject({ getter: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError('Invalid inputs passed, please check your data', 422);
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    const error = new HttpError('Something went wrong, Could not create user', 422);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError('User already exists, try login instead', 500);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    password,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError('Creating user failed, please try again', 500);
    return next(error);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    const error = new HttpError('Something went wrong, Could not create user', 422);
    return next(error);
  }

  if (existingUser.email !== email || existingUser.password === password) {
    const error = new HttpError('Invalid credentials, could not login in', 401);
    return next(error);
  }

  res.json({ message: 'Logged In!' });
};

// exports.getUsers = getUsers;
// exports.signup = signup;
// exports.login = login;

module.exports = { login, signup, getUsers };
