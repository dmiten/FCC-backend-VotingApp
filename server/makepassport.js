"use strict";

import passport from "passport";
import passportJwt from "passport-jwt";
import LocalStrategy from "passport-local";

import User from "./usermodel";

export default function makePassport() {

  const jwtOptions = {
    jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderWithScheme("jwt"),
    secretOrKey: process.env.JWT_SECRET
  };

  passport.use("local", new LocalStrategy({
        usernameField: "email",
        passwordField: "password",
        session: false
      }, (email, password, done) => {
        User.findOne({ email }, (err, user) => {
          return (err) ?
              done(err) :
              (!user || !user.checkPassword(password)) ?
                  done(null, false) :
                  done(null, user);
        });
      })
  );

  passport.use("jwt", new passportJwt.Strategy(jwtOptions, (payload, done) => {
        User.findById(payload.id, (err, user) => {
          return (err) ?
              done(err) :
              (user) ?
                  done(null, user) :
                  done(null, false);
        });
      })
  );

  return passport;
}