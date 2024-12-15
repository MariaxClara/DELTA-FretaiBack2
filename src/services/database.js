import pkg from 'pg';
import * as dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const {BDUSER, BDHOST, BDPASSWORD, BDDATABASE, BDPORT} = process.env;

const pool = new Pool({
  user: BDUSER,
  host: BDHOST,
  database: BDDATABASE,
  password: BDPASSWORD,
  port: BDPORT,
  ssl: {
    rejectUnauthorized: false,
  },
});


async function loginUser(email, password ){
  try {
    const client = await pool.connect();
    const res = await client.query(
      `SELECT user_id, email, senha, primeiro_login FROM users WHERE email = $1 AND senha = $2`,
      [email, password]
    );
    client.release();
    return res.rows[0] || null;
  } catch (error) {
    console.error('Erro ao logar usuário:', error.message);
    return null;
  }
}

async function getTables() {
  try {
    const client = await pool.connect();
    const res = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
    client.release();
    return res.rows;
  } catch (error) {
    console.error('Erro ao obter tabelas:', error.message);
    return null;
  }
}

async function updatePassword(email, newPassword) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `UPDATE users SET senha = $1 WHERE email = $2 RETURNING user_id, email, senha`,
      [newPassword, email]
    );

    if (res.rowCount === 0) return null;

    const { user_id, email: userEmail } = res.rows[0];
    return { user_id, email: userEmail, senha: '' };
  } catch (error) {
    console.error('Erro ao atualizar a senha:', (error).message);
    return null;
  } finally {
    client.release();
  }
}

async function getDriverInfoByEmail(email) {
  try {
    const client = await pool.connect();

    const userRes = await client.query(`SELECT user_id, email, nome, telefone FROM users WHERE email = $1`, [email]);

    if (userRes.rows.length === 0) {
      client.release();
      console.log("Motorista não encontrado.");
      return null;
    }

    client.release();

    return { nome: userRes.rows[0].nome, email: userRes.rows[0].email, telefone: userRes.rows[0].telefone };
  } catch (error) {
    console.error('Erro ao obter informações do motorista:', (error).message);
    return null;
  }
}

async function getPassengerInfoByEmail(email) {
  try {
    const client = await pool.connect();

    const res = await client.query(`
      SELECT 
          p.nome AS passageiro_nome, 
          u.email AS passageiro_email, 
          p.telefone AS passageiro_telefone,
          m.nome AS motorista_nome,
          m.telefone AS motorista_telefone
      FROM passageiros p
      JOIN users u ON p.user_id = u.user_id
      LEFT JOIN relacionamento_passageiro_rotas rpr ON p.passageiro_id = rpr.passageiro_id
      LEFT JOIN rotas r ON rpr.rotas_id = r.rota_id
      LEFT JOIN motoristas m ON r.motorista_id = m.motorista_id
      WHERE u.email = $1
    `, [email]);

    client.release();

    if (res.rows.length === 0) {
      return null;
    }

    return res.rows.map(row => ({
      passageiro_nome: row.passageiro_nome,
      passageiro_email: row.passageiro_email,
      passageiro_telefone: row.passageiro_telefone,
      motorista_nome: row.motorista_nome,
      motorista_telefone: row.motorista_telefone,
    }));
  } catch (error) {
    console.error('Erro ao obter informações do passageiro:', (error).message);
    return null;
  }
}

async function getImagePathByUser(email) {
  try {
    console.log('Buscando caminho da imagem para o email:', email);

    const userResult = await pool.query('SELECT user_id FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      throw new Error('Usuário não encontrado com o e-mail fornecido');
    }

    const userId = userResult.rows[0].user_id;

    const imageResult = await pool.query('SELECT image_path FROM user_images WHERE user_id = $1', [userId]);

    if (imageResult.rows.length > 0) {
      return imageResult.rows[0].image_path;
    } else {
      throw new Error('Imagem não encontrada para o usuário especificado');
    }
  } catch (error) {
    console.error('Erro ao buscar o caminho da imagem:', (error).message);
    return null;
  }
}

async function getUsersByDriverID(id){
  try {
    const client = await pool.connect();
    const res = await client.query(`
      select 
      u.nome AS passageiro_nome, 
      u.email AS passageiro_email,
      ui.image_path AS passageiro_imagem,
      p.pago AS passageiro_pagamento
      from passageiros p 
      inner join motoristas m 
      on m.motorista_id = p.motorista_id
      inner join users u 
      on u.user_id = p.user_id 
      inner join user_images ui 
      on ui.user_id = p.user_id
      where m.user_id = $1
    `, [id]);
    client.release();

    if (res.rows.length === 0) {
      return null;
    }

    return res.rows.map(row => ({
      passageiro_nome: row.passageiro_nome,
      passageiro_email: row.passageiro_email,
      passageiro_image: row.passageiro_image,
      passageiro_pagamento: row.passageiro_pagamento
    }));
  } catch (error) {
    console.error('Erro ao obter informações dos passageiros:', (error).message);
    return null;
  }
}

async function getInviteUsersByDriverID(id){
  try {
    const client = await pool.connect();
    const res = await client.query(`
      select email
      from inviteusers
      where motorista_id = $1
    `, [id]);

    client.release();

    if (res.rows.length === 0) {
      return null;
    }

    return res.rows.map(row => (row.email));

  } catch (error) {
    console.error('Erro ao obter emails convidados:', (error).message);
    return null;
  }
}

async function updatePay(email, paid) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `
      UPDATE passageiros p
      SET pago = $1
      FROM users u
      where u.user_id = p.user_id
      AND u.email = $2
      `,
      [paid, email]
    );
    if (res.rowCount === 0) return null;
    return res
  } catch (error) {
    console.error('Erro ao atualizar a confirmação de pagamento:', (error).message);
    return null;
  } finally {
    client.release();
  }
}

async function addUserEmailInvite(email, driverId) {
  const client = await pool.connect();
  try {
    let id = 1;
    const res = await client.query(
      `
      INSERT INTO inviteusers (motorista_id, email)
      VALUES ( $1, $2 );
      `,
      [id, email]
    );

    if (res.rowCount === 0) return null;
    return res.rows[0];

  } catch (error) {
    console.error('Erro ao adicionar cliente convidado:', (error).message);
    return null;
  } finally {
    client.release();
  }
}

async function getDriverByCode(code){
  const client = await pool.connect();

  const userRes = await client.query(`SELECT user_id FROM motoristas WHERE invite_cod = $1`, [code]);

  if (userRes.rows.length === 0) { 
    return -1; 
  }

  return userRes.rows[0].user_id

}

async function addPassenger(passageiro_user_id, motorista_id) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `
      insert into passageiros (passageiro_id, user_id, motorista_id)
      values ( ((select COUNT(*) from passageiros) + 1), $1, $2)
      `,
      [passageiro_user_id, motorista_id]
    );

    if (res.rowCount === 0) return null;
    return res

  } catch (error) {
    console.error('Erro ao adicionar passageiro na van do motorista:', (error).message);
    return null;
  } finally {
    client.release();
  }
}

async function getUserType(id) {
  return false
}

async function addUser(email, password, cpf, phone, name) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `
      insert into users (user_id,email,senha,cpf,telefone,nome)
      values ( ((select COUNT(*) from users) + 1), $1, $2, $3, $4, $5)
      `,
      [email, password, cpf, phone, name]
    );

    if (res.rowCount === 0) return null;
    return res

  } catch (error) {
    console.error('Erro ao criar conta:', (error).message);
    return null;
  } finally {
    client.release();
  }
}

async function getRaceInfoByEmail(email) {
  try {
    const client = await pool.connect();

    console.log("Buscando informações da corrida para o email:", email);

    const raceRes = await client.query(
      `
      SELECT 
          u.nome AS passageiro_nome, 
          p.passageiro_id AS passageiro_id,
          p.user_id AS user_id,
          u.email AS passageiro_email, 
          u.telefone AS passageiro_telefone,
          um.nome AS motorista_nome,
          um.telefone AS motorista_telefone,
          r.rota_id,
          r.destino,
          r.horario,
          r.dia_da_semana
      FROM passageiros p
      JOIN users u ON p.user_id = u.user_id
      LEFT JOIN relacionamento_passageiro_rotas rpr ON p.passageiro_id = rpr.passageiro_id
      LEFT JOIN rotas r ON rpr.rotas_id = r.rota_id
      LEFT JOIN motoristas m ON r.motorista_id = m.motorista_id
      LEFT JOIN users um ON m.user_id = um.user_id
      WHERE u.email = $1;
      `,
      [email]
    );

    // Nenhuma corrida encontrada
    if (raceRes.rows.length === 0) {
      console.log(
        "Nenhuma corrida encontrada para o passageiro com o email:",
        email
      );
      client.release();
      return []; // Retorna array vazio
    }

    let raceInfo = raceRes.rows.map((row) => ({
      passageiro_nome: row.passageiro_nome,
      passageiro_id: row.passageiro_id,
      passageiro_email: row.passageiro_email,
      passageiro_telefone: row.passageiro_telefone,
      motorista_nome: row.motorista_nome,
      motorista_telefone: row.motorista_telefone,
      rota_id: row.rota_id,
      destino: row.destino,
      horario: row.horario,
      dia_da_semana: row.dia_da_semana,
      user_id: row.user_id,
      status_corrida: null,
    }));

    for (let race of raceInfo) {
      const statusRes = await client.query(
        `
        SELECT 
            status 
        FROM 
            log_passageiro_rotas
        WHERE 
            rota_id = $1
        ORDER BY 
            created_at DESC
        LIMIT 1
        `,
        [race.rota_id]
      );

      if (statusRes.rows.length > 0) {
        race.status_corrida = statusRes.rows[0].status;
      } else {
        race.status_corrida = "Status não encontrado";
      }
    }

    // Filtra as corridas com status -1 (Canceladas)
    raceInfo = raceInfo.filter(
      (race) => race.status_corrida !== -1 && race.status_corrida !== "Status não encontrado"
    );

    client.release();
    console.log("Informações da corrida buscadas do banco:", raceInfo);
    return raceInfo; // Retorna sempre array
  } catch (error) {
    console.error("Erro ao buscar informações da corrida:", error.message);
    return []; // Retorna array vazio em caso de erro
  }
}


function changeRaceStatus(rota_id, passageiro_id ,status) {
  return new Promise(async (resolve, reject) => {
    try {
      const client = await pool.connect();

      // Insere o novo status na tabela status_viagem
      const query = `
        INSERT INTO log_passageiro_rotas (rota_id, passageiro_id, status) 
        VALUES ($1,$2,$3)
      `;
      await client.query(query, [rota_id,passageiro_id,status]);

      client.release();
      resolve("Status da corrida atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar o status da corrida database:", error.message);
      reject(`Erro ao atualizar o status da corrida database: ${error.message}`);
    }
  });
}




export { pool, loginUser, updatePassword, getTables, getDriverInfoByEmail, getPassengerInfoByEmail, getImagePathByUser, getUsersByDriverID, updatePay, getInviteUsersByDriverID, addUserEmailInvite, getUserType, addPassenger, getDriverByCode, addUser, getRaceInfoByEmail, changeRaceStatus };