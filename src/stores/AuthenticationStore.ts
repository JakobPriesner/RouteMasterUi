import { BaseStore } from './BaseStore';
import { CancelToken } from 'axios';
import { RegisterRequest, RegisterResponse } from '../types/AuthenticationTypes';
import {useNotifications} from "@toolpad/core/useNotifications";

class AuthenticationStoreClass extends BaseStore<RegisterResponse> {
    async registerUser(
        registerData: RegisterRequest,
        cancelToken?: CancelToken
    ): Promise<RegisterResponse> {
        const notifications = useNotifications();
        try {
            const response = await this.axios.post<RegisterResponse>(
                '/v1/identity/register',
                registerData,
                { cancelToken }
            );
            // Update state so subscribers can react
            this.setState(response.data);
            notifications.show('User registered successfully!', {
                severity: 'success',
                autoHideDuration: 3000,
            });
            return response.data;
        } catch (error: any) {
            this.handleError(error, 'Registration failed.');
            throw error;
        }
    }
}

export const AuthenticationStore = new AuthenticationStoreClass();
