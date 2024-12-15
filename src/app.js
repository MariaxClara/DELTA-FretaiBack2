import express from "express";
import * as dotenv from "dotenv";
import routes from "./routes.js";
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerDocs from '../swagger.json' with { type: "json" };



dotenv.config();
const app = express();
app.use(cors());

app.use("/api-docs",swaggerUi.serve,swaggerUi.setup(swaggerDocs))
let {PORT} = process.env;
if(!PORT) PORT= 3000;

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection at: ", reason.stack ?? reason);
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception at: ", error);
});

app.use(express.json());
app.use(routes);
app.listen(PORT, (err) => {
  if (err) console.log("Error in server setup");
  console.log("Server listening on Port", PORT);
});
