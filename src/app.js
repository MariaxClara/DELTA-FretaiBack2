import express from "express";
import * as dotenv from "dotenv";
import routes from "./routes.js";
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';


dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
const {PORT} = process.env || 3000;

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection at: ", reason.stack ?? reason);
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception at: ", error);
});

app.use(express.json());
app.use(routes);

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});



app.listen(PORT, (err) => {
  if (err) console.log("Error in server setup");
  console.log("Server listening on Port", PORT);
});