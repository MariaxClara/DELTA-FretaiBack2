import { pool, loginUser, updatePassword, getTables, getDriverInfoByEmail, getPassengerInfoByEmail, getImagePathByUser, getUsersByDriverID, updatePay, getInviteUsersByDriverID, addUserEmailInvite, getUserType, addPassenger, getDriverByCode, addUser, getRaceInfoByEmail, changeRaceStatus, getMessages, saveMessage, addCalendario, getCalendario, updateCalendario } from '../services/database.js';

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
  }
  else {
    res = await addCalendario(user__id, rotas_id, ida, volta, year, month, day);
  }

  if (!res) {
    return { statusCode: 404, body: { error: 'Não foi possível atualizar o calendário' } };
  }
  return { statusCode: 200, body: { message: 'success' } }
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
    changeRacePassengerStatus,
    setCalendario
}
