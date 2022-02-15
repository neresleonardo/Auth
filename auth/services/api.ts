import axios, {AxiosError} from  'axios';
import { parseCookies, setCookie } from 'nookies'

let cookies =  parseCookies();

export const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
        Authorization: `Bearer ${cookies['nextauth.token']}`
    }
});

api.interceptors.response.use(response => {
    return response;
}, (error: AxiosError) => {
    if(error.response.status === 400) {
        if (error.response.data?.code === 'token.expired'){
        // renovar o token
        cookies = parseCookies()

        const { 'nextauth.refreshToken': refreshToken } = cookies;

        api.post('/refresh', {
            refreshToken,
        }).then(response => {
            const { token } = response.data;

            setCookie(undefined, 'nextauth.token', token, {
                maxAge: 60 * 60 *24 * 30, // 30 dias
                path: '/', // Global
            })
            setCookie(undefined, 'nextauth.refreshToken', response.data.refreshToken, {
                maxAge: 60 * 60 *24 * 30, // 30 dias
                path: '/', // Global
            })

            api.defaults.headers['Authorization'] = `Bearer ${token}`
        })

        } else {
        // deslogar o usuario
        }
    }
    
}
)