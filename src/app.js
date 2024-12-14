import express from "express";
import * as dotenv from "dotenv";
import routes from "./routes.js";
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { saveMessage } from './services/database.js';


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
  console.log('Usuário conectado:', socket.id);

  socket.on('sendMessage', async ({ senderId, receiverId, content }) => {
    try {
      const savedMessage = await saveMessage(senderId, receiverId, content);

      io.emit(`receiveMessage-${receiverId}`, savedMessage);
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectado:', socket.id);
  });
});



app.listen(PORT, (err) => {
  if (err) console.log("Error in server setup");
  console.log("Server listening on Port", PORT);
});