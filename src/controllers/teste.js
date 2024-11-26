import { auxiliar1, auxiliar2 } from "../services/example.js"

async function teste(dado){
    try {
        const dado1 = await auxiliar1(dado);
        const dado2 = auxiliar2(dado1);
        return dado2;

    } catch (error){
        throw error
    }
};

export{
   teste
}