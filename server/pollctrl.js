"use strict";

import { serverLog } from "./server";
import Poll from "./pollmodel";

const pollCtrl = {};

export default pollCtrl;

pollCtrl.list = (req, res, next) => { // ◄------------------ get 10 random polls
  Poll.findRandom({}, {}, {limit: 10}, (err, result) => {
    if (err) {
      serverLog("error", "pollCtrl.list - error");
      res.json({ message: "error getting random polls" });
      next(err);
    } else {
      res.json({
        message: "ok",
        polls: result
      });
      serverLog("info", "pollCtrl.list - getting random polls ok");
    }
  });
};

pollCtrl.get = (req, res, next) => { // ◄-------------------- get poll's details

  Poll.findOne({ _id: req.body.pollId }, (err, poll) => {
    if (err) {
      serverLog("error", "pollCtrl.get -  " + err.message);
      res.json({ message: "error getting poll by id" });
    } else {
      res.json({
        message: "ok",
        poll: poll
      });
      serverLog("info", "pollCtrl.list - getting poll by id - ok");
    }
  });
};

pollCtrl.add = (req, res, next, passport) => { // ◄---------------- add new poll
  passport.authenticate("jwt", (err, user) => {
    if (err) {
      serverLog("error", "pollCtrl.add - error adding new poll");
      res.json({ message: "error adding new poll" });
      next(err);
    }
    if (user) {
      let poll = new Poll({
        owner: user.id,
        details: {
          question: req.body.poll.question,
          options: req.body.poll.options,
          votes: req.body.poll.votes
        }
      });
      poll.save((err, poll) => {
        if (err) {
          serverLog("error", "pollCtrl.add - error adding new poll");
          res.json({ message: "error adding new poll" });
          next(err);
        } else {
          serverLog("info", "pollCtrl.add - new poll added: " + poll.id);
          res.json({
            message: "new poll added",
            poll: poll
          });
        }
      });
    } else {
      serverLog("error", "pollCtrl.add - unauthorized");
      res.json({ message: "unauthorized" });
    }
  })(req, res, next);
};

pollCtrl.change = (req, res, next) => { // ◄------------------------ change poll
  Poll.findOne({ _id: req.body.poll._id }, (err, poll) => {
    if (err) {
      serverLog("error", "pollCtrl.change - error changing poll");
      res.json({ message: "error changing poll" });
      next(err);
    } else {
      if (poll.details.voted.indexOf(req.body.fingerprint) === -1) {
        poll.details =  req.body.poll.details;
        poll.save(err => {
          if (err) {
            serverLog("error", "pollCtrl.change - error changing poll");
            res.json({ message: "error changing poll" });
            next(err);
          } else {
            serverLog("info", "pollCtrl.change - poll " + poll._id + " changed");
            res.json({ message: "poll changed" });
          }
        });
      } else {
        serverLog("info", "pollCtrl.change - fraud " + poll._id);
        res.json({ message: "fingerprint voted already" });
      }
    }
  });
};

pollCtrl.delete = (req, res, next, passport) => { // ◄-------------- delete poll
  passport.authenticate("jwt", (err, user) => {
    if (err) {
      serverLog("error", "pollCtrl.delete - error deleting poll");
      res.json({ message: "error deleting poll" });
      next(err);
    }
    if (user) {
      Poll.findOne({ _id: req.body.pollId }, (err, poll) => {
        if (err) {
          serverLog("error", "pollCtrl.delete - " + err.message);
          res.json({ message: "deleting error" });
        } else {
          if (user._id.toString() === poll.owner.toString()) {
            poll.remove();
            res.json({ message: "poll deleted" });
            serverLog("info", "pollCtrl.delete - poll deleted");
          } else {
            res.json({ message: "other owner" });
            serverLog("error", "pollCtrl.delete - other owner");
          }
        }
      });
    } else {
      serverLog("error", "pollCtrl.delete - unauthorized");
      res.json({ message: "unauthorized" });
    }
  })(req, res, next);
};