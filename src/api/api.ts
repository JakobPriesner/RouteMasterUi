import axios from 'axios';
import { firebaseAuth } from "../firebase/firebaseConfig";

export const api = axios.create({
    baseURL: 'http://localhost:5050',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    },
});

api.interceptors.request.use(
    async (config) => {
        await firebaseAuth.authStateReady();

        const token = await firebaseAuth.currentUser?.getIdToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

let isNetworkError = false;

api.interceptors.response.use(
    (response) => {
        isNetworkError = false;
        return response;
    },
    (error) => {
        if (axios.isCancel(error)) {
            return null;
        }

        if (error.message && (
            error.message.includes('Network Error') ||
            !error.response ||
            error.code === 'ECONNABORTED' ||
            error.message.includes('timeout')
        )) {
            if (!isNetworkError) {
                isNetworkError = true;

                if (window.location.pathname !== '/no-connection') {
                    sessionStorage.setItem('redirectUrl', window.location.pathname);

                    // window.location.href = '/no-connection';
                }
            }
        } else {
            // todo: notifyOnError(error.response?.status);
        }

        return Promise.reject(error);
    }
);
