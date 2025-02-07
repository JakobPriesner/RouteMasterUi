// src/stores/UsersStore.ts
import { BaseStore } from './BaseStore';
import { CancelToken } from 'axios';
import { User } from '../types/UsersTypes';
import {useNotifications} from "@toolpad/core/useNotifications";

class UsersStoreClass extends BaseStore<User> {
    async getCurrentUser(cancelToken?: CancelToken): Promise<User> {
        try {
            const response = await this.axios.get<User>(
                '/v1/users/me',
                { cancelToken }
            );
            this.setState(response.data);
            return response.data;
        } catch (error: any) {
            this.handleError(error, 'Failed to fetch current user.');
            throw error;
        }
    }

    async deleteCurrentUser(token: string, cancelToken?: CancelToken): Promise<void> {
        const notifications = useNotifications();
        try {
            await this.axios.delete('/v1/users/me', {
                params: { token },
                cancelToken,
            });
            notifications.show('User deleted successfully!', {
                severity: 'success',
                autoHideDuration: 3000,
            });
        } catch (error: any) {
            this.handleError(error, 'Failed to delete current user.');
            throw error;
        }
    }

    async requestUserDeletion(cancelToken?: CancelToken): Promise<void> {
        const notifications = useNotifications();
        try {
            await this.axios.post(
                '/v1/users/me/request-deletion',
                null,
                { cancelToken }
            );
            notifications.show('User deletion requested!', {
                severity: 'success',
                autoHideDuration: 3000,
            });
        } catch (error: any) {
            this.handleError(error, 'Failed to request user deletion.');
            throw error;
        }
    }
}

export const UsersStore = new UsersStoreClass();
