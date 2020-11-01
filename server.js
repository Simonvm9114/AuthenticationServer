require('dotenv').config();

const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');

// Create application
const app = express();

// Connect to database
// mongoose.connect(
//   `mongodb+srv://authServer:${process.env.MONGODB_PWD}@cluster0.dphvb.mongodb.net/authenticationDB`,
//   { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
//   () => {
//     console.log('DB connected');
//   }
// );

// User session configuration
app.use(
  require('express-session')({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

// Routes
app.get('/', (req, res) => {
  if (!req.user) {
    res.send('<a href="/auth/google" role="button">Sign In with Google</a>');
  } else {
    res.send(
      `Welcome ${req.user.name} <br> <a href="/logout" role="button">Logout</a>`
    );
  }
});

app.get('/authenticate', (req, res) => {
  console.log('authenticate');
});

app.get('/isauthenticated', (req, res) => {
  if (!req.user) {
    res.send({ isAuthenticated: false });
  } else {
    res.send({ isAuthenticated: true, ...req.user });
  }
});

// Route snippets
const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`);
});
