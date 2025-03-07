import { BaseStore } from './BaseStore';
import { CancelToken } from 'axios';
import { User } from '../types/UsersTypes';
import { BehaviorSubject } from 'rxjs';
import { useNotifications } from '@toolpad/core/useNotifications';

class UsersStoreClass extends BaseStore {
    protected currentUser$ = new BehaviorSubject<User | null>(null);
    private currentUserPromise: Promise<User> | null = null;

    getCurrentUser(cancelToken?: CancelToken): BehaviorSubject<User | null> {
        if (this.currentUser$.getValue()) {
            return this.currentUser$;
        }
        if (this.currentUserPromise) {
            return this.currentUser$;
        }
        this.currentUserPromise = this.axios
            .get<User>('/v1/users/me', { cancelToken })
            .then(response => {
                this.currentUser$.next(response.data);
                return response.data;
            })
            .catch(error => {
                this.handleError(error, 'Failed to fetch current user.');
                this.currentUser$.error(error);
                throw error;
            })
            .finally(() => {
                this.currentUserPromise = null;
            });
        return this.currentUser$;
    }

    deleteCurrentUser(token: string, cancelToken?: CancelToken): BehaviorSubject<null> {
        const subject = new BehaviorSubject<null>(null);
        const notifications = useNotifications();
        this.axios
            .delete('/v1/users/me', { params: { token }, cancelToken })
            .then(() => {
                notifications.show('User deleted successfully!', { severity: 'success', autoHideDuration: 3000 });
                subject.next(null);
            })
            .catch(error => {
                this.handleError(error, 'Failed to delete current user.');
                subject.error(error);
            });
        return subject;
    }

    requestUserDeletion(cancelToken?: CancelToken): BehaviorSubject<null> {
        const subject = new BehaviorSubject<null>(null);
        const notifications = useNotifications();
        this.axios
            .post('/v1/users/me/request-deletion', null, { cancelToken })
            .then(() => {
                notifications.show('User deletion requested!', { severity: 'success', autoHideDuration: 3000 });
                subject.next(null);
            })
            .catch(error => {
                this.handleError(error, 'Failed to request user deletion.');
                subject.error(error);
            });
        return subject;
    }
}

export const UsersStore = new UsersStoreClass();
