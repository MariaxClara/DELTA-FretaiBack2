import pkg from 'pg';
import * as dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;


const {BDUSER, BDHOST, BDPASSWORD, BDDATABASE, BDPORT} = process.env || 3000;

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

    const userRes = await client.query(`SELECT nome, email, telefone FROM users WHERE email = $1`, [email]);

    if (userRes.rows.length === 0) {
      client.release
      console.log("Usuário não encontrado.");
      return null;
    }

    const userName = userRes.rows[0].nome;
    const userEmail = userRes.rows[0].email;
    const userPhone = userRes.rows[0].telefone;

    client.release();

    return { nome: userName, email: userEmail, telefone: userPhone };
  } catch (error) {
    console.error('Erro ao obter informações do motorista:', (error).message);
    return null;
  }
}

async function getPassengerInfoByEmail(email) {
  try {
    const client = await pool.connect();

    const res = await client.query(`
      SELECT DISTINCT ON (u2.nome)
        u.nome AS passageiro_nome,
        u.email AS passageiro_email,
        u.telefone AS passageiro_telefone,
        u2.nome AS motorista_nome, 
        u2.telefone AS motorista_telefone
      FROM users u 
      JOIN passageiros p ON u.user_id = p.user_id
      JOIN relacionamento_passageiro_rotas r ON p.passageiro_id = r.passageiro_id
      JOIN rotas r2 ON r.rotas_id = r2.rota_id
      JOIN motoristas m ON r2.motorista_id = m.motorista_id
      JOIN users u2 ON m.user_id = u2.user_id
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
      p.nome AS passageiro_nome, 
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
    return res.rows[0];

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

async function getUserType(id) {
  return false
}

export { pool, loginUser, updatePassword, getTables, getDriverInfoByEmail, getPassengerInfoByEmail, getImagePathByUser, getUsersByDriverID, updatePay, getInviteUsersByDriverID, addUserEmailInvite, getUserType };