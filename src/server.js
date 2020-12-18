const express = require("express");

const movieRoute = require("./media")
const cors = require("cors");
const {
  notFoundHandler,
  unauthorizedHandler,
  forbiddenHandler,
  badRequestHandler,
  catchAllHandler,
} = require("./errorHandling")

const server = express();

const port = process.env.PORT||3001;
server.use(cors());
server.use(express.json());
server.use("/movies",movieRoute)
server.use(badRequestHandler) // error has to be after the route because it comes on next (in middlewares errors handling)
server.use(notFoundHandler)

server.use(forbiddenHandler)
server.use(unauthorizedHandler)
server.use(catchAllHandler)
server.listen(port, () => {
  console.log("server running on ", port);
});