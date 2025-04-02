import axios from 'axios'
import { getToken } from '../utils/auth';

const API_URL = 'https://docs.coincap.io/'

export const getCryptos = async () => {
    const token = getToken();

    return axios.get(`${API_URL}/cryptos`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}

export const addCrypto = async (crypto: {name: string, symbol: string, price: number, trend: number}) => {
    return axios.post(`${API_URL}/cryptos`, crypto)
}

export const login = async (email: string, password: string): Promise<string> => {
    return axios.post(`http://localhost:3001/auth/login`, { email, password })
        .then((response) => {
            if (!response.data.token) {
                throw new Error('No se encontró el token de autenticación');
            }
            const { token } = response.data;
            return token;
        })
}
