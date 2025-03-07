// src/types/ContactsTypes.ts

import {Address} from "./AddressTypes";

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
    address: Address;
}

export interface ContactMinimalInfo {
    id: string;
    fullName: string;
    customerId: string;

    additionalInfo: {}
}

export interface LookupContactsResult {
    contacts: ContactMinimalInfo[];
    matchingContactsCount: number;
}

export interface GetAllContactsByIdsRequest{
    contactIds: string[];
}

export interface GetContactByIdResponse {
    contact: Contact;
}

export interface GetAllContactsResult {
    contacts: Contact[];
    matchingContactsCount: number;
}

export interface GetContactByIdResult {
    contact: Contact | null;
}
