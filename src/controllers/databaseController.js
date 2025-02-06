import sgMail from '@sendgrid/mail';
import { pool, loginUser, updatePassword, getTables, getDriverInfoByEmail, getPassengerInfoByEmail, getImagePathByUser,getPassengerInfoById, getUsersByDriverID, updatePay, getInviteUsersByDriverID, addUserEmailInvite, getUserType, addPassenger, getDriverByCode, addUser, getRaceInfoByEmail, getDriversByEmail, changeRaceStatus, getMessages, saveMessage, addCalendario, getCalendario, updateCalendario, addMotorista } from '../services/database.js';



sgMail.setApiKey(process.env.SENDGRID_API_KEY);



//GET FUNCTIONS
async function driverInfo(email) {
    if (!email) {
        return { statusCode: 400, body: { error: 'Email é necessário' } };
    }
    
    const driverInfo = await getDriverInfoByEmail(email);
    
    if (!driverInfo) {
        return { statusCode: 404, body: { error: 'Motorista não encontrado' } };
    }
    
    return { statusCode: 200, body: driverInfo };
}

async function passengerInfoId(id) {
  if (!id) {
      return { statusCode: 400, body: { error: 'Id é necessário' } };
  }

  const userInfo = await getPassengerInfoById(id);

  if (!userInfo) {
      return { statusCode: 404, body: { error: 'Passageiro não encontrado' } };
  }
  
  return { statusCode: 200, body: userInfo };
}

async function driverInvites(id) {
  if (!id) {
    return { statusCode: 400, body: { error: 'Id é necessário' } };
  }

  const inviteUsersInfo = await getInviteUsersByDriverID(id);

  if (!inviteUsersInfo) {
    return { statusCode: 404, body: { error: 'Passageiros convidados do motorista não encontrados' } };
  }

  return { statusCode: 200, body: inviteUsersInfo };

}


async function driverUsers(id) {
    if (!id) {
        return { statusCode: 400, body: { error: 'Id é necessário' } };
    }
    
    const usersDriverInfo = await getUsersByDriverID(id);
    
    if (!usersDriverInfo) {
        return { statusCode: 404, body: { error: 'Passageiros do motorista não encontrados' } };
    }
    
    return { statusCode: 200, body: usersDriverInfo };
}


async function imagePath(email) {
    if (!email) {
        return { statusCode: 400, body: { error: 'Email é necessário' } };
    }

    const imagePath = await getImagePathByUser(email);
    
    if (!imagePath) {
        return { statusCode: 404, body: { error: 'Imagem não encontrada' } };
    }
    return { statusCode: 200, body: { imagePath } };
}


async function login(email, password) {
    const user = await loginUser(email, password);

    if (user) {
      return { status: 'success', user };
    } else {
      return { status: 'error', message: 'Credenciais inválidas' };
    }

}


async function passengerInfo(email) {
  if (!email) {
    return { statusCode: 400, body: { error: 'Email é necessário' } };
  }

  const passengerInfo = await getPassengerInfoByEmail(email);

  if (!passengerInfo) {
    return { statusCode: 404, body: { error: 'Passageiro não encontrado' } };
  }

  return { statusCode: 200, body: passengerInfo };

}

async function cadastrarMotorista(nome, email, senha, cpf, telefone, modelo_veiculo, placa_veiculo) {
  try {
    console.log('Iniciando cadastro do motorista...');
    console.log({ nome, email, senha, cpf, telefone, modelo_veiculo, placa_veiculo });

    // Inserir o usuário
    const userResponse = await addUser(email, senha, cpf, telefone, nome);
    console.log('Resposta de addUser:', userResponse);

    if (!userResponse || !userResponse.user_id) {
      console.error('Erro ao obter user_id do usuário cadastrado.');
      return { statusCode: 400, body: { error: 'Erro ao cadastrar o usuário.' } };
    }

    const userId = userResponse.user_id;

    // Inserir o motorista
    const motoristaResponse = await addMotorista(userId, modelo_veiculo, placa_veiculo);
    console.log('Resposta de addMotorista:', motoristaResponse);

    if (!motoristaResponse) {
      console.error('Erro ao inserir motorista.');
      return { statusCode: 400, body: { error: 'Erro ao cadastrar o motorista.' } };
    }

    return { statusCode: 201, body: { message: 'Motorista cadastrado com sucesso!' } };
  } catch (error) {
    console.error('Erro no cadastro de motorista:', error.message);
    return { statusCode: 500, body: { error: 'Erro ao cadastrar motorista.' } };
  }
}




async function tables() {
  const tables = await getTables();
  return tables;

}


async function userType(id) {
  const userType = await getUserType(id);
  if (userType == null) {
    return { statusCode: 404, body: { error: 'Não foi possivel encontrar o usuário' } };
  }
  return { statusCode: 200, body: userType }

}


//POST FUNCTIONS
async function addDriverInvite(email, id) {
    if (!email) {
      return { statusCode: 400, body: { error: 'Email é necessário' } };
    }
    if (id==null) {
      return { statusCode: 400, body: { error: 'Id do motorista é necessário' } };
    }

    const res = await addUserEmailInvite(email, id);
  
    if (!res) {
      return { statusCode: 404, body: { error: 'Não foi possivel atualizar os convites enviados' } };
    }

    return { statusCode: 200, body: { message: 'success' } };
}


async function changePassword(email, newPassword, confirmPassword) {
  if (newPassword !== confirmPassword) {
    return { status: 'error', message: 'As senhas não coincidem' };
  }

  const updateResult = await updatePassword(email, newPassword);

  if (updateResult) {
    return { status: 'success', message: 'Senha atualizada com sucesso' };
  } else {
    return { status: 'error', message: 'Usuário não encontrado ou erro ao atualizar senha' };
  }

}


async function updateUserPay(email, paid) {
  if (!email) {
    return { statusCode: 400, body: { error: 'Email é necessário' } };
  }
  if (paid==null) {
    return { statusCode: 400, body: { error: 'Confirmação de pagamento é necessário' } };
  }

  const res = await updatePay(email, paid);

  if (!res) {
    return { statusCode: 404, body: { error: 'Motorista não encontrado' } };
  }
  return { statusCode: 200, body: { message: 'success' } }
  }

async function addPassengerUser(email, password, code) {
  const motorista_id = await getDriverByCode(code)
  if(motorista_id==-1) {
    console.log('Código não encontrado')
    return { statusCode: 400, body: { message: -1 } };
  }

  const passenger_info = await loginUser(email, password)
  console.log(passenger_info)
   if(passenger_info==null) {
    console.log('Login ou senha incorretos')
    return { statusCode: 401, body: { message: -2 } };
  }
  const passenger_id = (passenger_info.user).user_id

  const res = await addPassenger(passenger_id, motorista_id)

  if (!res) {
    return { statusCode: 404, body: { error: 'Não foi possível adicionar o passageiro na van do motorista' } };
  }
  return { statusCode: 200, body: { message: 1 } };
}

async function addNewUser(email, password, cpf, phone, name) {
  
  const newUser = await addUser(email, password, cpf, phone, name);

  if (!newUser) {
    return { statusCode: 404, body: { error: 'Não foi possível criar a conta' } };
  }
  return { statusCode: 200, body: { newUser } };
  
}

async function getRaceInfo(email) {
  if (!email) {
      return { statusCode: 400, body: { error: 'Email é necessário' } };
  }

  const raceInfo = await getRaceInfoByEmail(email);

  if (!raceInfo || raceInfo.length === 0) {
      return { statusCode: 404, body: { error: 'Corrida não encontrada para o passageiro' } };
  }

  return { statusCode: 200, body: { raceInfo } };
}

async function getDrivers(email) {
  if (!email) {
      return { statusCode: 400, body: { error: 'Email é necessário' } };
  }

  const raceInfo = await getDriversByEmail(email);

  if (!raceInfo || raceInfo.length === 0) {
      return { statusCode: 404, body: { error: 'Passageiro não encontrado para o passageiro' } };
  }

  return { statusCode: 200, body: { raceInfo } };
}

async function changeRacePassengerStatus(rota_id, passageiro_id, status_corrida) {
  // Validar os dados recebidos
  if (!rota_id || !passageiro_id || status_corrida === undefined) {
      return {
          statusCode: 400,
          body: { error: "Dados incompletos. Certifique-se de enviar 'rota_id', 'passageiro_id' e 'status_corrida'." }
      };
  }

  try {
      // Chamar a função para alterar o status no banco de dados
      const result = await changeRaceStatus(rota_id, passageiro_id, status_corrida);

      // Retornar a mensagem de sucesso
      return { statusCode: 200, body: { message: result } };
  } catch (error) {
      console.error("Erro ao atualizar o status da corrida:", error.message);

      // Retornar mensagem de erro
      return {
          statusCode: 500,
          body: { error: "Erro interno ao processar a solicitação." }
      };
  }
}

async function enviarEmailParaAprovacao(data) {
  const { nome, email, senha, cpf, telefone, modelo_veiculo, placa_veiculo } = data;

  try {
      const approvalLink = `http://localhost:3000/cadastroMotorista/aprovar?nome=${encodeURIComponent(nome)}&email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}&cpf=${encodeURIComponent(cpf)}&telefone=${encodeURIComponent(telefone)}&modelo_veiculo=${encodeURIComponent(modelo_veiculo)}&placa_veiculo=${encodeURIComponent(placa_veiculo)}`;

      const msg = {
          to: process.env.ADMIN_EMAIL, 
          from: process.env.EMAIL_USER,
          subject: 'Aprovação de Cadastro de Motorista',
          text: `Um novo motorista deseja se cadastrar.\n\nClique no link para aprovar:\n${approvalLink}`,
      };

      await sgMail.send(msg);

      return { statusCode: 200, body: { message: 'E-mail de aprovação enviado com sucesso.' } };
  } catch (error) {
      console.error('Erro ao enviar e-mail de aprovação:', error.message);
      return { statusCode: 500, body: { error: 'Erro ao enviar e-mail.' } };
  }
}

async function aprovarCadastroMotorista(data) {
  const { nome, email, senha, cpf, telefone, modelo_veiculo, placa_veiculo } = data;

  try {
      const userRes = await addUser(email, senha, cpf, telefone, nome);
      if (!userRes) {
          return { statusCode: 400, body: { error: 'Erro ao cadastrar usuário.' } };
      }

      const userId = userRes.user_id;
      const motoristaRes = await addMotorista(userId, modelo_veiculo, placa_veiculo);
      if (!motoristaRes) {
          return { statusCode: 400, body: { error: 'Erro ao cadastrar motorista.' } };
      }

      return { statusCode: 200, body: { message: 'Cadastro aprovado e motorista cadastrado com sucesso!' } };
  } catch (error) {
      console.error('Erro ao aprovar cadastro de motorista:', error.message);
      return { statusCode: 500, body: { error: 'Erro ao processar aprovação.' } };
  }
}

async function fetchMessages(senderId, receiverId) {
  if (!senderId || !receiverId) {
    return { statusCode: 400, body: { error: 'Sender e receiver são necessarios' } };
  }
  const messages = await getMessages(senderId, receiverId);
  return { statusCode: 200, body: messages };
}

async function storeMessage(senderId, receiverId, content) {
  if (!senderId || !receiverId || !content) {
    return { statusCode: 400, body: { error: 'Sender, receiver e content são necessários' } };
  }

  try {
    const message = await saveMessage(senderId, receiverId, content);
    return { statusCode: 201, body: message }; 
  } catch (error) {
    console.error('Erro ao salvar mensagem:', error);
    return { statusCode: 500, body: { error: 'Erro ao salvar mensagem no banco de dados' } };
  }
}

async function setCalendario(user__id, rotas_id, ida, volta, year, month, day) {
  if (!user__id) {
    return { statusCode: 400, body: { error: 'Usuario é necessário' } };
  }
  if (!rotas_id) {
    return { statusCode: 400, body: { error: 'A rota é necessária' } };
  }
  if (ida == null) {
    return { statusCode: 400, body: { error: 'A ida é necessária' } };
  }
  if (volta == null) {
    return { statusCode: 400, body: { error: 'A volta é necessária' } };
  }
  if (!year) {
    return { statusCode: 400, body: { error: 'O ano é necessário' } };
  }
  if (!month) {
    return { statusCode: 400, body: { error: 'O mês é necessário' } };
  }
  if (!day) {
    return { statusCode: 400, body: { error: 'O dia é necessário' } };
  }
  let res;
  const exists = await getCalendario(user__id, rotas_id, year, month, day);
  if (exists) {
    res = await updateCalendario(user__id, rotas_id, ida, volta, year, month, day);
    console.log("update");
  }
  else {
    console.log("add");
    res = await addCalendario(user__id, rotas_id, ida, volta, year, month, day);
  }

  if (!res) {
    return { statusCode: 404, body: { error: 'Não foi possível atualizar o calendário' } };
  }
  return { statusCode: 200, body: { message: 'success' } }
}


async function getCalendarioInfo(user__id, rotas_id, year, month, day = 0) {
  // Validar os dados recebidos
  if (!rotas_id || !user__id || !year || !month === undefined) {
      return {
          statusCode: 400,
          body: { error: "Dados incompletos. Certifique-se de enviar 'rota_id', 'passageiro_id', 'ano' e 'mes'." }
      };
  }

  try {
      // Chamar a função para alterar o status no banco de dados
      const result = await getCalendario(user__id, rotas_id, year, month, day);

      // Retornar a mensagem de sucesso
      return { statusCode: 200, body: { message: result } };
  } catch (error) {
      console.error("Erro ao pegar o status do dia:", error.message);
      // Retornar mensagem de erro
      return {
          statusCode: 500,
          body: { error: "Erro interno ao processar a solicitação." }
      };
  }
}

async function deletePassenger(p_id, d_id) {
    if ((!p_id) || (!d_id)) {
        return { statusCode: 400, body: { error: 'Id é necessário' } };
    }
    
    const res = await deletePassengerFromDriver(p_id,d_id);
    
    if (!res) {
        return { statusCode: 404, body: { error: 'Não foi possivel excluir o passageiro' } };
    }
    
    return { statusCode: 200, body: res };
}


export {
    driverInfo,
    driverInvites,
    driverUsers,
    imagePath,
    login,
    passengerInfo,
    tables,
    userType,
    addDriverInvite,
    changePassword,
    fetchMessages,
    storeMessage,
    updateUserPay,
    addPassengerUser,
    addNewUser,
    getRaceInfo,
    getDrivers,
    changeRacePassengerStatus,
    setCalendario,
    cadastrarMotorista,
    enviarEmailParaAprovacao,
    aprovarCadastroMotorista,
    getCalendarioInfo,
    passengerInfoId,
    deletePassenger
}
