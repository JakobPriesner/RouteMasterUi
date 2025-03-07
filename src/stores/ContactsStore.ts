import { BaseStore } from './BaseStore';
import { CancelToken } from 'axios';
import {
    AddContactRequest,
    Contact,
    GetAllContactsByIdsRequest,
    GetAllContactsResult,
    GetContactByIdResponse, LookupContactsResult
} from '../types/ContactsTypes';
import { BehaviorSubject } from 'rxjs';

class ContactsStoreClass extends BaseStore<GetAllContactsResult> {
    protected contacts$ = new BehaviorSubject<{ [key: string]: Contact }>({});
    protected lookup$: { [search: string]: LookupContactsResult } = {};
    protected cachedPages: { [key: string]: BehaviorSubject<GetAllContactsResult> } = {};

    getAllContactsOfProject(
        projectId: string,
        filters: { page?: number; pageSize?: number; search?: string } = {},
        cancelToken?: CancelToken
    ): BehaviorSubject<GetAllContactsResult> {
        const initialData: GetAllContactsResult = { contacts: [], matchingContactsCount: 0 };
        const subject = new BehaviorSubject<GetAllContactsResult>(initialData);

        const { page = 1, pageSize = 20, search = '' } = filters;
        const key = `${projectId}|${page}|${pageSize}|${search}`;

        if (this.cachedPages[key]) {
            this.cachedPages[key].subscribe(subject);
            return subject;
        }

        this.cachedPages[key] = subject;

        this.axios
            .get<GetAllContactsResult>(`/v1/projects/${projectId}/contacts`, {
                params: { ...filters },
                cancelToken
            })
            .then(response => {
                subject.next(response.data);
                this.addContactsToCache(response.data.contacts);
            })
            .catch(error => {
                this.handleError(error, 'Failed to fetch contacts.');
                subject.error(error);
            });

        return subject;
    }

    getContactsByIds(
        projectId: string,
        contactIds: string[],
        cancelToken?: CancelToken
    ): BehaviorSubject<Contact[]> {
        const subject = new BehaviorSubject<Contact[]>([]);

        this.contacts$.subscribe(cachedContacts => {
            const localContacts = Object.values(cachedContacts).filter(contact =>
                contactIds.includes(contact.id)
            );

            if (localContacts.length === contactIds.length) {
                subject.next(localContacts);
                return;
            }

            const missingContacts = contactIds.filter(
                id => !localContacts.some(contact => contact.id === id)
            );
            const request: GetAllContactsByIdsRequest = {
                contactIds: missingContacts
            };

            this.axios
                .post<GetAllContactsResult>(`/v1/projects/${projectId}/contacts/batch-get`, request, { cancelToken })
                .then(response => {
                    this.addContactsToCache(response.data.contacts);
                    const updatedContacts = [
                        ...localContacts,
                        ...response.data.contacts.filter(contact => missingContacts.includes(contact.id))
                    ];
                    subject.next(updatedContacts);
                })
                .catch(error => {
                    this.handleError(error, 'Failed to load contacts.');
                    subject.error(error);
                });
        });

        return subject;
    }

    getContactById(
        projectId: string,
        contactId: string,
        cancelToken?: CancelToken
    ): BehaviorSubject<Contact | null> {
        const subject = new BehaviorSubject<Contact | null>(null);

        this.contacts$.subscribe(cachedContacts => {
            if (cachedContacts[contactId]) {
                subject.next(cachedContacts[contactId]);
                return;
            }

            this.axios
                .get<GetContactByIdResponse>(`/v1/projects/${projectId}/contacts/${contactId}`, { cancelToken })
                .then(response => {
                    this.addContactsToCache([response.data.contact]);
                    subject.next(response.data.contact);
                })
                .catch(error => {
                    this.handleError(error, 'Failed to load contact.');
                    subject.error(error);
                });
        });

        return subject;
    }

    async lookupContacts(projectId: string, search: string, additionalFields: string[], signal: AbortSignal): Promise<LookupContactsResult> {
        if (search.length < 4) {
            return {contacts: [], matchingContactsCount: 0};
        }

        const key = `${projectId}|${search}|${additionalFields.join(',')}`;

        if (key in this.lookup$) {
            return this.lookup$[key];
        }

        const additionalFieldsAsString = additionalFields.join(",");
        const response = await this.axios.get<LookupContactsResult>(
            `/v1/projects/${projectId}/contacts/lookup?search=${encodeURI(search)}&additionalFields=${encodeURI(additionalFieldsAsString)}`,
            {signal}
        );

        if (response) {
            this.lookup$[key] = response?.data;
        }

        return response?.data;
    }

    async addContact(
        projectId: string,
        contactData: AddContactRequest,
        cancelToken?: CancelToken
    ): Promise<string> {
        try {
            const response = await this.axios.post<string>(
                `/v1/projects/${projectId}/contacts`,
                contactData,
                { cancelToken }
            );

            const newContact: Contact = {
                ...contactData,
                id: response.data,
                address: {
                    ...contactData.address,
                    note: contactData.address.note ?? ''
                }
            };

            this.addContactsToCache([newContact]);
            this.updateCachedPagesOnAddContact(projectId, newContact);

            return response.data;
        } catch (error: any) {
            this.handleError(error, 'Failed to add contact.');
            throw error;
        }
    }

    async updateContact(
        projectId: string,
        contactId: string,
        contactData: Partial<Contact>,
        cancelToken?: CancelToken
    ): Promise<void> {
        const currentContacts = this.contacts$.getValue();
        const originalContact = currentContacts[contactId] || null;
        const updatedContact = { ...originalContact, ...contactData, id: contactId };

        this.updateContactsInCache(updatedContact);

        try {
            const url = `/v1/projects/${projectId}/contacts/${contactId}`;
            await this.axios.put<Contact>(url, contactData, { cancelToken });
        } catch (error) {
            this.handleError(error, 'Failed to update contact.');
            if (originalContact) {
                this.updateContactsInCache(originalContact);
            }
        }
    }

    async deleteContactById(
        projectId: string,
        contactId: string,
        cancelToken?: CancelToken
    ): Promise<void> {
        const currentContacts = this.contacts$.getValue();
        const deletedContact = currentContacts[contactId];

        this.deleteContactInCache(contactId);

        try {
            const url = `/v1/projects/${projectId}/contacts/${contactId}`;
            await this.axios.delete(url, { cancelToken });
        } catch (error: any) {
            this.handleError(error, 'Failed to delete contact.');
            if (deletedContact) {
                this.addContactsToCache([deletedContact]);
            }
            throw error;
        }
    }

    protected addContactsToCache(contacts: Contact[]): void {
        const currentContacts = this.contacts$.getValue();
        const updatedContacts = { ...currentContacts };

        contacts.forEach(contact => {
            updatedContacts[contact.id] = contact;
        });

        this.contacts$.next(updatedContacts);
    }

    protected updateContactsInCache(contact: Contact): void {
        const currentContacts = this.contacts$.getValue();
        const updatedContacts = { ...currentContacts, [contact.id]: contact };
        this.contacts$.next(updatedContacts);
    }

    protected deleteContactInCache(contactId: string): void {
        const currentContacts = this.contacts$.getValue();
        const updatedContacts = { ...currentContacts };
        delete updatedContacts[contactId];
        this.contacts$.next(updatedContacts);
    }

    protected updateCachedPagesOnAddContact(projectId: string, newContact: Contact): void {
        Object.entries(this.cachedPages).forEach(([key, subject]) => {
            const [keyProjectId, pageStr, pageSizeStr, ...searchParts] = key.split('|');
            if (keyProjectId !== projectId) return;

            const page = Number(pageStr);
            const pageSize = Number(pageSizeStr);

            const pageData = subject.getValue();
            pageData.matchingContactsCount = (pageData.matchingContactsCount || 0) + 1;

            if (page === 1 && pageData.contacts.length < pageSize) {
                pageData.contacts.unshift(newContact);
            } else if (page > 1) {
                const pagesForProject = Object.keys(this.cachedPages)
                    .filter(k => {
                        const [projId, , , searchPart] = k.split('|');
                        return projId === projectId && !searchPart;
                    })
                    .map(k => Number(k.split('|')[1]));
                const maxPage = pagesForProject.length > 0 ? Math.max(...pagesForProject) : 1;
                if (page === maxPage) {
                    pageData.contacts.push(newContact);
                }
            }
            subject.next(pageData);
        });
    }
}

export const ContactsStore = new ContactsStoreClass();
