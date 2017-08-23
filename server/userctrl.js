"use strict";

import jwt from "jsonwebtoken";

import User from "./usermodel";

import { serverLog } from "./server";

const userCtrl = {};

export default userCtrl;

let generateToken = (user) => {
  return (
      jwt.sign({
        id: user.id,
        iat: Date.now(),
        exp: Date.now() + 1000 * 60 * 60 * 72
      }, process.env.JWT_SECRET)
  );
};

userCtrl.signup = (req, res, next) => { // ◄----------------------------- signup

  User.findOne({ email: req.body.email }, (err, user, next) => {
    if (err) {
      next(err);
    }
    if (user) {
      res.json({ message: "email already used" });
      serverLog("info", "userCtrl.signup - email already used");
    } else {
      User.create(req.body, (err, user, next) => {
        if (err) {
          next(err);
        } else {
          res.json({
            message: "new user " + user.email + "  logged in",
            token: "JWT " + generateToken(user),
            user: {
              userId:  user._id,
              email: user.email,
              ownPollsId: user.ownPollsId
            }
          });
          serverLog("info", "userCtrl.signup - new user " + user.email + " added");
        }
      });
    }
  });
};

userCtrl.login = (req, res, next, passport) => { // ◄--------------------- login

  passport.authenticate("local", (err, user) => {
    if (err) {
      next(err);
    } else {
      if (!user) {
        res.json({ message: "login failed" });
        serverLog("info", "userCtrl.login - login failed");
      } else {
        res.json({
          message: "user " + user.email + "  logged in",
          token: "JWT " + generateToken(user),
          user: {
            userId:  user._id,
            email: user.email,
            ownPollsId: user.ownPollsId
          }
        });
        serverLog("info", "userCtrl.login - user " + user.email + " logged in");
      }
    }
  })(req, res, next);
};

userCtrl.pushOwnPollsId = (req, res, next, passport) => { // ◄-- receive ownPollsId

  passport.authenticate("jwt", (err, user) => {
    if (err) {
      next(err);
    }
    if (user) {
      user.update({ ownPollsId: req.body.ownPollsId }, (err, user) => {
        if (err) {
          res.json({ message: "error updating" });
          serverLog("info", "userCtrl.pushOwnPollsId - error updating");
        } else {
          res.json({ message: "ownPollsId received & updated" });
          serverLog("info", "userCtrl.pushOwnPollsId - ownPollsId received & updated");
        }
      });
    } else {
      res.status(401).json({ message: "unauthorized" });
      serverLog("info", "userCtrl.pushOwnPollsId - unauthorized");
    }
  })(req, res, next);
};

userCtrl.logout = (req, res, next, passport) => { // ◄------------------- logout

  passport.authenticate("jwt", (err, user) => {
    if (err) {
      next(err);
    }
    if (user) {
      req.logout();
      res.json({ message: "user " + req.body.email + " logged out" });
      serverLog("info", "userCtrl.logout - user " + req.body.email + " logged out");
    } else {
      res.status(401).json({ message: "unauthorized" });
      serverLog("info", "userCtrl.logout - unauthorized");
    }
  })(req, res, next);
};