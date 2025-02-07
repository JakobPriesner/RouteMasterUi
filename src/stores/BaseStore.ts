import { api } from '../api/api';
import { BehaviorSubject } from 'rxjs';
import {useNotifications} from "@toolpad/core/useNotifications";

/**
 * BaseStore is an abstract class that provides shared functionality
 * for all API group stores. It maintains an observable state via a
 * BehaviorSubject and offers methods for updating state and handling errors.
 */
export abstract class BaseStore<T = any> {
    protected axios = api;

    protected subject = new BehaviorSubject<T | null>(null);

    public data$ = this.subject.asObservable();

    /**
     * setState updates the store's state and notifies all subscribers.
     * @param data - The new state data.
     */
    protected setState(data: T): void {
        this.subject.next(data);
    }

    /**
     * handleError extracts a message from the error object (or uses a custom one)
     * and shows it using the notifications service.
     * @param error - The error caught from an API call.
     * @param customMessage - Optional custom error message.
     */
    protected handleError(error: any, customMessage?: string): void {
        const notifications = useNotifications();
        const message =
            customMessage ||
            error?.response?.data?.message ||
            error.message ||
            'Unknown error occurred';
        notifications.show(message, { severity: 'error', autoHideDuration: 3000 });
    }
}
