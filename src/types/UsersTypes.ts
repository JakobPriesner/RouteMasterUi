// src/types/UsersTypes.ts

import { BillingToken } from './BillingTypes';
import { ProjectOfUser } from './UsersToProjectsTypes';

export interface User {
    id: string;
    userName: string;
    email: string;
    billingTokens?: BillingToken[];
    projects?: ProjectOfUser[];
}
