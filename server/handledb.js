"use strict";

import mongoose from "mongoose";

import { serverApp, serverLog } from "./server.js";

export function dbStart() {

  let mongodb = process.env.MONGOLAB_URI || "mongodb://localhost:27017";

  mongoose.Promise = global.Promise;
  mongoose.connect(mongodb, { useMongoClient: true })
  .catch(err => serverLog("error", "mongoose: " + err.message));

  mongoose.connection.on("connected", () => {
    serverLog("info", "handledb - mongoose connection open");

    serverApp(); // ◄-------------------------------------- time to start server
  });

  mongoose.connection.on("error", err => {
    serverLog("error", "handledb - mongoose connection error: " + err);
  });

  mongoose.connection.on("disconnected", () => {
    serverLog("info", "handledb - mongoose disconnected");
  });

  process.on("SIGINT", () => {
    mongoose.connection.close(() => {
      serverLog("info", "handledb - mongoose disconnected through app termination");
      process.exit(0);
    });
  });
}

