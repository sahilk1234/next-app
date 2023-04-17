"use strict";

// Load deps
const http = require("http");
const app = require("./app");

/* Server creation
 * --------------- */

// listening port
const PORT = process.env.PORT || 3001;
app.set(PORT);

// Create Web server
http
  .createServer(app)
  .listen(PORT, () => console.log(`Node app running at localhost:${PORT}`));
