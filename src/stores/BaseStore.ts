import { api } from '../api/api';
import { useNotifications } from '@toolpad/core/useNotifications';

/**
 * BaseStore is an abstract class that provides shared functionality
 * for all API group stores. It only provides the axios instance and common
 * error handling.
 */
export abstract class BaseStore<T = any> {
    protected axios = api;

    protected handleError(error: any, customMessage?: string): void {
        const message = customMessage || error?.response?.data?.message || error.message || 'Unknown error occurred';
        console.error(customMessage, message);
    }
}
