export type BillingPlan = 'Basic' | 'Advanced' | 'Premium';

export interface AddTokenRequest {
    ownedBy: string;
    plan: BillingPlan;
}

export type AddTokenResponse = string;

export interface BillingToken {
    token: string;
    regardingProjectId: string;
    plan: BillingPlan;
}

export interface GetAllTokensOfUserResult {
    tokens: BillingToken[];
}
