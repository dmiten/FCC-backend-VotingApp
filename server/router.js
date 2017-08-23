"use strict";

import userCtrl from "./userctrl";
import pollCtrl from "./pollctrl";

export default function router (app, passport) {

  app.post("/user/signup", (req, res, next) => userCtrl.signup(req, res, next));

  app.post("/user/login", (req, res, next) => userCtrl.login(req, res, next, passport));
  app.post("/user/logout", (req, res, next) => userCtrl.logout(req, res, next, passport));
  app.post("/user/pushOwnPollsId", (req, res, next) => userCtrl.pushOwnPollsId(req, res, next, passport));

  app.post("/poll/list", (req, res, next) => pollCtrl.list(req, res, next));

  app.post("/poll/get", (req, res, next) => pollCtrl.get(req, res, next));
  app.post("/poll/add", (req, res, next) => pollCtrl.add(req, res, next, passport));
  app.post("/poll/change", (req, res, next) => pollCtrl.change(req, res, next));
  app.post("/poll/delete", (req, res, next) => pollCtrl.delete(req, res, next, passport));

};