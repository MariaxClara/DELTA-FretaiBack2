import { Router } from "express";
import { addDriverInvite, driverInfo, driverInvites, driverUsers, imagePath, login, passengerInfo } from "./controllers/databaseController.js";

const router = Router();

router.get("/", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "1800");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    res.setHeader( "Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS" );
    res.send("Aplicação para consultar informações dos passageiros do Fretai");
});

router.get("/driverInfo", async (req, res) => {
    const { email } =  req.params;
    try{
      const response = await driverInfo(email);
      res.json(response);
    } catch (error){
      res.status(500).send(error);
    }
})
router.get("/driverInvites", async (req, res) => {
    const { id } =  req.params;
    try{
      const response = await driverInvites(id);
      res.json(response);
    } catch (error){
      res.status(500).send(error);
    }
})
router.get("/driverUsers", async (req, res) => {
    const { id } =  req.params;
    try{
      const response = await driverUsers(id);
      res.json(response);
    } catch (error){
      res.status(500).send(error);
    }
})
router.get("/imagePath", async (req, res) => {
    const { email } =  req.params;
    try{
      const response = await imagePath(email);
      res.json(response);
    } catch (error){
      res.status(500).send(error);
    }
})
router.get("/login", async (req, res) => {
  const { email, password } =  req.params;
  try{
    const response = await login(email, password);
    res.json(response);
  } catch (error){
    res.status(500).send(error);
  }
})
router.get("/passengerInfo", async (req, res) => {
  const { email } =  req.params;
  try{
    const response = await passengerInfo(email);
    res.json(response);
  } catch (error){
    res.status(500).send(error);
  }
})


router.post("/", (req, res) => {
    res.sendStatus(200);
});

router.post("/addUserEmailInvite", async (req, res) => {
    const { email, id } =  req.params;
    try{
      const response  = await addDriverInvite(email, id);
      res.json(response);
    } catch (error){
      res.status(500).send(error);
    }
})

export default router;