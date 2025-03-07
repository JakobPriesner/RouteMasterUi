import { BaseStore } from './BaseStore';
import { CancelToken } from 'axios';
import { RegisterRequest, RegisterResponse } from '../types/AuthenticationTypes';

class AuthenticationStoreClass extends BaseStore<RegisterResponse> {
    async registerUser(
        registerData: RegisterRequest,
        cancelToken?: CancelToken
    ): Promise<RegisterResponse> {
        try {
            const response = await this.axios.post<RegisterResponse>(
                '/v1/identity/register',
                registerData,
                { cancelToken }
            );
            return response.data;
        } catch (error: any) {
            this.handleError(error, 'Es gab ein Problem während der Registrierung.');
            throw error;
        }
    }
}

export const AuthenticationStore = new AuthenticationStoreClass();
