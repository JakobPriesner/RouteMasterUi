import { BaseStore } from './BaseStore';
import { CancelToken } from 'axios';
import { AddTokenRequest, AddTokenResponse, GetAllTokensOfUserResult } from '../types/BillingTypes';
import {useNotifications} from "@toolpad/core/useNotifications";

class BillingStoreClass extends BaseStore<GetAllTokensOfUserResult> {
    async addToken(
        addTokenData: AddTokenRequest,
        cancelToken?: CancelToken
    ): Promise<AddTokenResponse> {
        const notifications = useNotifications();
        try {
            const response = await this.axios.post<AddTokenResponse>(
                '/v1/billing/tokens',
                addTokenData,
                { cancelToken }
            );
            notifications.show('Token added successfully!', {
                severity: 'success',
                autoHideDuration: 3000,
            });
            return response.data;
        } catch (error: any) {
            this.handleError(error, 'Failed to add token.');
            throw error;
        }
    }

    async getAllTokensOfUser(cancelToken?: CancelToken): Promise<GetAllTokensOfUserResult> {
        try {
            const response = await this.axios.get<GetAllTokensOfUserResult>(
                '/v1/billing/tokens',
                { cancelToken }
            );
            this.setState(response.data);
            return response.data;
        } catch (error: any) {
            this.handleError(error, 'Failed to fetch tokens.');
            throw error;
        }
    }
}

export const BillingStore = new BillingStoreClass();
