import axios from 'axios';

async function auxiliar1(dado) {
    try {
      const response = await axios.get(`api/${dado}`);
      return response.data;
    } catch (error) {
      throw new Error(error)
    }
}

function auxiliar2(dado){
    return dado;
}

export {
    auxiliar1,
    auxiliar2
}
  