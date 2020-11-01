require('dotenv').config();

const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app = express();

app.use(require('body-parser').urlencoded({ extended: true }));
app.use(
  require('express-session')({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(
  `mongodb+srv://authServer:${process.env.MONGODB_PWD}@cluster0.dphvb.mongodb.net/authenticationDB`,
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
  () => {
    console.log('DB connected');
  }
);

const userSchema = new mongoose.Schema({
  name: String,
  googleId: String,
});

userSchema.plugin(findOrCreate);

const User = new mongoose.model('User', userSchema);

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:4500/auth/google/welcome',
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOrCreate(
        { googleId: profile.id, name: profile.displayName },
        function (err, user) {
          return cb(null, user);
        }
      );
    }
  )
);

app.get('/', (req, res) => {
  if (!req.user) {
    res.send('<a href="/auth/google" role="button">Sign In with Google</a>');
  }
  res.send(`Welcome ${req.user.name}`);
});

app.get('/login', (req, res) => {
  res.send('<a href="/auth/google" role="button">Sign In with Google</a>');
});

app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
);

app.get(
  '/auth/google/welcome',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  }
);

const PORT = process.env.PORT || 4500;
app.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`);
});
