const router = require('express').Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
// models
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/welcome',
    },
    function (accessToken, refreshToken, profile, cb) {
      // User.findOrCreate(
      //   { googleId: profile.id, name: profile.displayName },
      //   function (err, user) {
      //     return cb(null, user);
      //   }
      // );
      return cb(null, { googleId: profile.id, name: profile.displayName });
    }
  )
);

router
  .route('/google')
  .get(passport.authenticate('google', { scope: ['profile'] }));

router
  .route('/google/welcome')
  .get(
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect('/');
    }
  );

module.exports = router;
