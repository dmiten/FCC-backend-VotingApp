require("dotenv").config({ // ◄- first of all load .env variables to the process
  path: "./server/.data/.env",
  silent: true
});

require("babel-register");
require('./server.js').serverStart();