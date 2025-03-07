import { BaseStore } from './BaseStore';
import { CancelToken } from 'axios';
import { AddUserToProjectRequest, AddUserToProjectResult } from '../types/UsersToProjectsTypes';
import { BehaviorSubject } from 'rxjs';
import { useNotifications } from '@toolpad/core/useNotifications';

class UsersToProjectsStoreClass extends BaseStore {
    addUserToProject(
        projectId: string,
        userId: string,
        data: AddUserToProjectRequest,
        cancelToken?: CancelToken
    ): BehaviorSubject<AddUserToProjectResult | null> {
        const subject = new BehaviorSubject<AddUserToProjectResult | null>(null);
        const notifications = useNotifications();
        this.axios
            .post<AddUserToProjectResult>(`/v1/projects/${projectId}/users/${userId}`, data, { cancelToken })
            .then(response => {
                notifications.show('User added to project successfully!', { severity: 'success', autoHideDuration: 3000 });
                subject.next(response.data);
            })
            .catch(error => {
                this.handleError(error, 'Failed to add user to project.');
                subject.error(error);
            });
        return subject;
    }

    deleteUserFromProject(
        projectId: string,
        userId: string,
        cancelToken?: CancelToken
    ): BehaviorSubject<null> {
        const subject = new BehaviorSubject<null>(null);
        const notifications = useNotifications();
        this.axios
            .delete(`/v1/projects/${projectId}/users/${userId}`, { cancelToken })
            .then(() => {
                notifications.show('User removed from project successfully!', { severity: 'success', autoHideDuration: 3000 });
                subject.next(null);
            })
            .catch(error => {
                this.handleError(error, 'Failed to remove user from project.');
                subject.error(error);
            });
        return subject;
    }
}

export const UsersToProjectsStore = new UsersToProjectsStoreClass();
