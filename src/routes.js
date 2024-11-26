import { Router } from "express";
import { teste } from "./controllers/example.js";

const router = Router();

router.get("/", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "1800");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    res.setHeader( "Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS" );
    res.send("Aplicação para consultar informações dos passageiros do Fretai");
});

router.get("/example", async (req, res) => {
    const { dado } =  req.params;
    try{
      const dadoBanco = await teste(dado);
      res.json(dadoBanco);
    }catch (error){
      res.status(500).send(error);
    }
})

router.post("/", (req, res) => {
    res.sendStatus(200);
});

export default router;