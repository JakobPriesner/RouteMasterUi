// src/stores/UsersToProjectsStore.ts
import { BaseStore } from './BaseStore';
import { CancelToken } from 'axios';
import {
    AddUserToProjectRequest,
    AddUserToProjectResult,
} from '../types/UsersToProjectsTypes';
import {useNotifications} from "@toolpad/core/useNotifications";

class UsersToProjectsStoreClass extends BaseStore<AddUserToProjectResult> {
    async addUserToProject(
        projectId: string,
        userId: string,
        data: AddUserToProjectRequest,
        cancelToken?: CancelToken
    ): Promise<AddUserToProjectResult> {
        const notifications = useNotifications();
        try {
            const response = await this.axios.post<AddUserToProjectResult>(
                `/v1/projects/${projectId}/users/${userId}`,
                data,
                { cancelToken }
            );
            notifications.show('User added to project successfully!', {
                severity: 'success',
                autoHideDuration: 3000,
            });
            this.setState(response.data);
            return response.data;
        } catch (error: any) {
            this.handleError(error, 'Failed to add user to project.');
            throw error;
        }
    }

    async deleteUserFromProject(
        projectId: string,
        userId: string,
        cancelToken?: CancelToken
    ): Promise<void> {
        const notifications = useNotifications();
        try {
            await this.axios.delete(
                `/v1/projects/${projectId}/users/${userId}`,
                { cancelToken }
            );
            notifications.show('User removed from project successfully!', {
                severity: 'success',
                autoHideDuration: 3000,
            });
        } catch (error: any) {
            this.handleError(error, 'Failed to remove user from project.');
            throw error;
        }
    }
}

export const UsersToProjectsStore = new UsersToProjectsStoreClass();
