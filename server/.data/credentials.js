"use strict";

import fs from "fs";

import { serverLog } from "../server.js";

export const credentials = (() => {

  try {
    serverLog("info", "credentials - cert&key for https are loaded");
    return { // ◄------------------------------------ server be able to be https
      cert: fs.readFileSync("./server/.data/cert.pem"),
      key: fs.readFileSync("./server/.data/key.pem")
    };
  } catch (err) { // ◄-------------------- it's ok, but server will be http only
    serverLog("error", "credentials - error loading");
    return false;
  }

})();