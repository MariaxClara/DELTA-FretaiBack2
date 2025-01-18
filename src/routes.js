import { Router } from "express";
import  sgMail from '@sendgrid/mail';
import * as dotenv from "dotenv";

import { addDriverInvite, addPassengerUser, changePassword, driverInfo, driverInvites, driverUsers, imagePath, login, passengerInfo, tables, updateUserPay, addNewUser, getRaceInfo, changeRacePassengerStatus, userType, fetchMessages, storeMessage, setCalendario, passengerInfoId } from "./controllers/databaseController.js";


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
router.get("/passengerInfoId/:id", async (req, res) => {
  const { id } =  req.params;
  try{
    const response = await passengerInfoId(id);
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


router.get('/chat/:senderId/:receiverId', async (req, res) => {
  const { senderId, receiverId } = req.params;

  try {
    const response = await fetchMessages(senderId, receiverId);
    res.status(response.statusCode).json(response.body);
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error.message);
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
});



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

router.get('/getRaceInfo/:email', async (req, res) => {
  const { email } = req.params; // Obtendo o email dos parâmetros da rota

  try {
    // Chama a função principal para buscar informações da corrida
    const response = await getRaceInfo(email);

    // Retorna a resposta com o status e o body apropriados
    res.status(response.statusCode).send(response.body);
  } catch (error) {
    console.error("Erro no endpoint /getRaceInfo/:email:", error.message);
    res.status(500).send({ error: "Erro ao processar a solicitação." });
  }
});

router.get('/changeRacePassengerStatus/:rota_id/:passageiro_id/:status_corrida', async (req, res) => {
  const { rota_id, passageiro_id, status_corrida } = req.params; // Obtendo os parâmetros da rota

  // Validação dos parâmetros
  if (!rota_id || !passageiro_id || !status_corrida) {
    return res.status(400).send({ error: "Dados incompletos. Certifique-se de enviar 'rota_id', 'passageiro_id' e 'status_corrida'." });
  }

  try {
    // Chama a função principal para verificar e alterar o status da corrida
    const response = await changeRacePassengerStatus(rota_id, passageiro_id, status_corrida);

    // Retorna a resposta com o status e o body apropriados
    res.status(response.statusCode).send(response.body);
  } catch (error) {
    console.error("Erro no endpoint /checkRaceStatus/:rota_id/:passageiro_id/:status_corrida:", error.message);
    res.status(500).send({ error: "Erro ao processar a solicitação." });
  }
});



router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const response = await login(email, password);
    res.json(response);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/user-type', async (req, res) => {
  const { user_id } = req.query; // Obtendo o user_id da query string

  if (!user_id) {
    return res.status(400).json({ error: 'Parâmetro user_id é obrigatório.' });
  }

  try {
    // Chamando a função que verifica o tipo no banco de dados
    // console.log(user_id);
    
    const userTypeResult = await userType(user_id);

    if (userTypeResult.body === 0) {
      return res.json({ userType: 'motorista' });
    } else if (userTypeResult.body === 1) {
      return res.json({ userType: 'passageiro' });
    } else {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao determinar tipo de usuário AAAAAA:', error.message);
    return res.status(500).json({ error: 'Erro ao determinar tipo de usuário.' });
  }
});



router.post('/chat', async (req, res) => {
  const { senderId, receiverId, content } = req.body;
  const response = await storeMessage(senderId, receiverId, content);

  res.status(response.statusCode).json(response.body);
});

router.post('/setCalendario', async (req, res) => {
  const { user__id, rotas_id, ida, volta, year, month, day } = req.body;
  const response = await setCalendario(user__id, rotas_id, ida, volta, year, month, day);

  res.status(response.statusCode).json(response.body);
});

export default router;