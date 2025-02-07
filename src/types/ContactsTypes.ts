// src/types/ContactsTypes.ts

export interface AddAddressRequest {
    street: string;
    city: string;
    houseNumber: string;
    zip: number;
    latitude?: number;
    longitude?: number;
    note?: string;
}

export interface AddContactRequest {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    customerId?: string;
    address: AddAddressRequest;
}

export interface Contact {
    id: string;
    customerId?: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    address: AddAddressRequest;
}

export interface GetAllContactsResult {
    contacts: Contact[];
    matchingContactsCount: number;
}

export interface GetContactByIdResult {
    contact: Contact | null;
}
