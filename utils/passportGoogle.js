const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user.model");
const CryptoJs = require("crypto-js");

const callback =
  process.env.NODE_ENV === "production" && process.env.GOOGLE_CALLBACK_URL_PRD
    ? process.env.GOOGLE_CALLBACK_URL_PRD
    : process.env.GOOGLE_CALLBACK_URL_DEV;

console.log(callback);

module.exports = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL_PRD,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Find by googleId
          let user = await User.findOne({ googleId: profile.id });
          if (user) return done(null, user);

          const email =
            profile.emails && profile.emails.length > 0
              ? profile.emails[0].value
              : null;

          // If email exists, try to link Google account
          if (email) {
            let existingUser = await User.findOne({ email });
            if (existingUser) {
              if (!existingUser.googleId) existingUser.googleId = profile.id;
              if (!existingUser.displayName)
                existingUser.displayName = profile.displayName;
              if (!existingUser.photo)
                existingUser.photo = profile.photos[0]?.value;
              if (!existingUser.password) {
                existingUser.password = CryptoJs.AES.encrypt(
                  Math.random().toString(36).slice(-8),
                  process.env.PSW_SECRET
                ).toString();
              }
              await existingUser.save();
              return done(null, existingUser);
            }
          }

          // If no user exists, create one
          user = await User.create({
            googleId: profile.id,
            displayName: profile.displayName,
            email,
            photo: profile.photos[0]?.value,
            password: CryptoJs.AES.encrypt(
              Math.random().toString(36).slice(-8),
              process.env.PSW_SECRET
            ).toString(),
          });

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
