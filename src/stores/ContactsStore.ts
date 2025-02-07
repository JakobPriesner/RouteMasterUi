import { BaseStore } from './BaseStore';
import { CancelToken } from 'axios';
import { AddContactRequest, GetAllContactsResult, Contact } from '../types/ContactsTypes';
import {useNotifications} from "@toolpad/core/useNotifications";

class ContactsStoreClass extends BaseStore<GetAllContactsResult> {
    async getAllContactsOfProject(
        projectId: string,
        filters: { page?: number; pageSize?: number; search?: string } = {},
        cancelToken?: CancelToken
    ): Promise<GetAllContactsResult> {
        try {
            const response = await this.axios.get<GetAllContactsResult>(
                `/v1/projects/${projectId}/contacts`,
                { params: filters, cancelToken }
            );
            this.setState(response.data);
            return response.data;
        } catch (error: any) {
            this.handleError(error, 'Failed to fetch contacts.');
            throw error;
        }
    }

    async addContact(
        projectId: string,
        contactData: AddContactRequest,
        cancelToken?: CancelToken
    ): Promise<string> {
        const notifications = useNotifications();
        try {
            const response = await this.axios.post<string>(
                `/v1/projects/${projectId}/contacts`,
                contactData,
                { cancelToken }
            );
            notifications.show('Contact added successfully!', {
                severity: 'success',
                autoHideDuration: 3000,
            });
            // Optionally refresh the contacts list
            await this.getAllContactsOfProject(projectId, {}, cancelToken);
            return response.data;
        } catch (error: any) {
            this.handleError(error, 'Failed to add contact.');
            throw error;
        }
    }

    /**
     * Optimistically updates a contact.
     * Immediately updates local state then confirms with the server.
     * Rolls back if the update fails.
     */
    async updateContact(
        projectId: string,
        contactId: string,
        contactData: Partial<Contact>,
        cancelToken?: CancelToken
    ): Promise<Contact> {
        const notifications = useNotifications();
        const url = `/v1/projects/${projectId}/contacts/${contactId}`;
        const currentState = this.subject.getValue();
        if (!currentState) {
            throw new Error('No contacts data available for optimistic update.');
        }
        const originalContact = currentState.contacts.find((c) => c.id === contactId);
        if (!originalContact) {
            throw new Error('Contact not found in local state.');
        }
        const optimisticallyUpdated = { ...originalContact, ...contactData };
        const updatedContacts = currentState.contacts.map((c) =>
            c.id === contactId ? optimisticallyUpdated : c
        );
        this.setState({ ...currentState, contacts: updatedContacts });

        try {
            const response = await this.axios.put<Contact>(url, contactData, { cancelToken });
            const confirmedContacts = currentState.contacts.map((c) =>
                c.id === contactId ? response.data : c
            );
            this.setState({ ...currentState, contacts: confirmedContacts });
            notifications.show('Contact updated successfully!', {
                severity: 'success',
                autoHideDuration: 3000,
            });
            return response.data;
        } catch (error: any) {
            // Roll back optimistic update.
            this.setState(currentState);
            this.handleError(error, 'Failed to update contact.');
            throw error;
        }
    }

    async deleteContactById(
        projectId: string,
        contactId: string,
        cancelToken?: CancelToken
    ): Promise<void> {
        const notifications = useNotifications();
        const url = `/v1/projects/${projectId}/contacts/${contactId}`;
        try {
            await this.axios.delete(url, { cancelToken });
            const currentState = this.subject.getValue();
            if (currentState) {
                const updatedContacts = currentState.contacts.filter((c) => c.id !== contactId);
                this.setState({ ...currentState, contacts: updatedContacts });
            }
            notifications.show('Contact deleted successfully!', {
                severity: 'success',
                autoHideDuration: 3000,
            });
        } catch (error: any) {
            this.handleError(error, 'Failed to delete contact.');
            throw error;
        }
    }
}

export const ContactsStore = new ContactsStoreClass();
