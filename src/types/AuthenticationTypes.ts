// src/types/AuthenticationTypes.ts

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export type RegisterResponse = string;
