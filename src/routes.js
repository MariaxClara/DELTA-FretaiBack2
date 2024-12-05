import { Router } from "express";
import  sgMail from '@sendgrid/mail';
import * as dotenv from "dotenv";
import { addDriverInvite, addPassengerUser, changePassword, driverInfo, driverInvites, driverUsers, imagePath, login, passengerInfo, tables, updateUserPay, addNewUser } from "./controllers/databaseController.js";


dotenv.config();
const {SENDGRID_API_KEY} = process.env;
sgMail.setApiKey(SENDGRID_API_KEY);

const router = Router();

router.get("/", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "1800");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    res.setHeader( "Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS" );
    res.send("Aplicação para consultar informações dos passageiros do Fretai");
});

router.get("/driverInfo/:email", async (req, res) => {
    const { email } =  req.params;
    try{
      const response = await driverInfo(email);
      res.json(response);
    } catch (error){
      res.status(500).send(error);
    }
})
router.get("/driverInvites/:id", async (req, res) => {
    const { id } =  req.params;
    try{
      const response = await driverInvites(id);
      res.json(response);
    } catch (error){
      res.status(500).send(error);
    }
})
router.get("/driverUsers/:id", async (req, res) => {
    const { id } =  req.params;
    try{
      const response = await driverUsers(id);
      res.json(response);
    } catch (error){
      res.status(500).send(error);
    }
})
router.get("/imagePath/:email", async (req, res) => {
    const { email } =  req.params;
    try{
      const response = await imagePath(email);
      res.json(response);
    } catch (error){
      res.status(500).send(error);
    }
})
router.get("/login/:email/:password", async (req, res) => {
  const { email, password } =  req.params;
  try{
    const response = await login(email, password);
    res.json(response);
  } catch (error){
    res.status(500).send(error);
  }
})
router.get("/passengerInfo/:email", async (req, res) => {
  const { email } =  req.params;
  try{
    const response = await passengerInfo(email);
    res.json(response);
  } catch (error){
    res.status(500).send(error);
  }
})
router.get("/tables", async (req, res) => {
  try{
    const response = await tables();
    res.json(response);
  } catch (error){
    res.status(500).send(error);
  }
})


router.post("/", (req, res) => {
    res.sendStatus(200);
});

router.post("/addUserEmailInvite", async (req, res) => {
    const { email, id } =  req.body;
    try{
      const response  = await addDriverInvite(email, id);
      res.json(response);
    } catch (error){
      res.status(500).send(error);
    }
})
router.post("/changePassword", async (req, res) => {
  const { email, newPassword, confirmPassword } =  req.body;
  try{
    const response  = await changePassword(email, newPassword, confirmPassword);
    res.json(response);
  } catch (error){
    res.status(500).send(error);
  }
})
router.post("/updateUserPay", async (req, res) => {
  const { email, paid } =  req.body;
  try{
    const response  = await updateUserPay(email, paid);
    res.json(response);
  } catch (error){
    res.status(500).send(error);
  }
})
router.post('/sendEmail', async (req, res) => {
  const { to, from, subject, text } = req.body;
  const msg = { to, from, subject, text };
  try {
    await sgMail.send(msg);
    res.status(200).send('Convite enviado com sucesso');
  } catch (error) {
    res.status(500).send('Não foi possível enviar o convite: ',error);
  }
});
router.post('/addPassengerUser', async (req, res) => {
  const { email, password, code} = req.body;
  
  try {
    const response  = await addPassengerUser(email, password, code);
    res.status(response.statusCode).send(response.body)
  } catch (error) {
    console.log(error)
    res.status(500).send(error);
  }
});
router.post('/addNewUser', async (req, res) => {
  const { email, password, cpf, phone, name } = req.body;
  
  try {
    const response  = await addNewUser(email, password, cpf, phone, name);
    res.status(response.statusCode).send('Usuário cadastrado com sucesso')
  } catch (error) {
    console.log(error)
    res.status(500).send(error);
  }
});


export default router;