import { BaseStore } from './BaseStore';
import { CancelToken } from 'axios';
import { AddTokenRequest, AddTokenResponse, BillingToken, GetAllTokensOfUserResult } from '../types/BillingTypes';
import { BehaviorSubject } from 'rxjs';
import { useNotifications } from '@toolpad/core/useNotifications';

class BillingStoreClass extends BaseStore {
    protected tokensCache$ = new BehaviorSubject<BillingToken[] | null>(null);

    getAllTokensOfUser(cancelToken?: CancelToken): BehaviorSubject<BillingToken[]> {
        const subject = new BehaviorSubject<BillingToken[]>([]);

        this.tokensCache$.subscribe(tokens => {
            if (tokens) {
                subject.next(tokens);
                return;
            }

            this.axios
                .get<GetAllTokensOfUserResult>('/v1/billing/tokens', { cancelToken })
                .then(response => {
                    const tokensArray = response.data.tokens;
                    const currentCache = this.tokensCache$.getValue();
                    tokensArray.forEach(tokenObj => {
                        currentCache[tokenObj.token] = tokenObj;
                    });
                    this.tokensCache$.next(currentCache);
                    subject.next(Object.values(currentCache));
                })
                .catch(error => {
                    this.handleError(error, 'Es gab einen Fehler beim Laden der Abrechnungstokens.');
                    subject.error(error);
                });
        });

        return subject;
    }

    async addToken(
        addTokenData: AddTokenRequest,
        cancelToken?: CancelToken
    ): Promise<AddTokenResponse | null> {
        const notifications = useNotifications();
        const response = await this.axios.post<AddTokenResponse>('/v1/billing/tokens', addTokenData, { cancelToken });

        notifications.show('Token added successfully!', {
            severity: 'success',
            autoHideDuration: 3000,
        });

        return response.data;
    }
}

export const BillingStore = new BillingStoreClass();
