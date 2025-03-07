import React, { useEffect, useState } from "react";
import { LinearProgress } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useNotifications } from "@toolpad/core/useNotifications";
import { GetAllContactsResult } from "../../types/ContactsTypes";
import { ContactsStore } from "../../stores/ContactsStore";
import CreateContactDialog from "../../dialogs/createContactDialog";
import ContactsTable from "../../components/contacts/contactsTable";

const baseColumns: Column[] = [
    { id: 'firstName', label: 'Vorname', minWidth: 100 },
    { id: 'lastName', label: 'Nachname', minWidth: 100 },
    { id: 'email', label: 'Mail', minWidth: 100 },
    { id: 'phone', label: 'Telefonnummer', minWidth: 170 },
];

const Contacts = () => {
    const navigate = useNavigate();
    const notifications = useNotifications();
    const { projectId } = useParams();
    const [createContactDialogOpen, setCreateContactDialogOpen] = useState(false);
    const [searchString, setSearchString] = useState<string>("");
    const [currentContacts, setContacts] = useState<GetAllContactsResult | undefined>(undefined);
    const [dynamicColumns, setDynamicColumns] = useState<Column[]>(baseColumns);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [selectedContacts, setSelectedContacts] = useState<any[]>([]);

    useEffect(() => {
        if (!projectId) {
            notifications.show("Ungültige URL. Bitte überprüfe die ProjektID in deiner URL.");
            navigate("/projects");
            return;
        }

        setSearchLoading(true);

        ContactsStore.getAllContactsOfProject(projectId, { search: searchString })
            .subscribe({
                next: contacts => {
                    onNewContact(contacts);
                    setSearchLoading(false);
                },
                error: () => setSearchLoading(false)
            });
    }, [projectId, searchString, navigate, notifications]);

    function onNewContact(contacts: GetAllContactsResult) {
        setContacts(contacts);

        const hasCustomerId = contacts.contacts.some(contact => contact.customerId);

        setDynamicColumns((prevColumns) => {
            if (hasCustomerId) {
                const customerIdColumn: Column = {
                    id: 'customerId',
                    label: 'Kundennummer',
                    minWidth: 50
                };

                if (!prevColumns.some(col => col.id === 'customerId')) {
                    return [customerIdColumn, ...prevColumns];
                }
            } else {
                return prevColumns.filter(col => col.id !== 'customerId');
            }

            return prevColumns;
        });
    }

    const handleContactRowClick = (contact: any) => {
        navigate(`/projects/${projectId}/contacts/${contact.id}`);
    };

    if (!projectId) {
        return null;
    }

    if (!currentContacts) {
        return <LinearProgress />;
    }

    return (
        <>
            <CreateContactDialog
                open={createContactDialogOpen}
                onClose={() => setCreateContactDialogOpen(false)}
                projectId={projectId}
            />

            <ContactsTable
                contacts={currentContacts.contacts}
                columns={dynamicColumns}
                totalCount={currentContacts.matchingContactsCount}
                loading={searchLoading}
                searchString={searchString}
                onSearchChange={setSearchString}
                onRowClick={handleContactRowClick}
                onAddContact={() => setCreateContactDialogOpen(true)}
                selectable={false}
                selectedContacts={selectedContacts}
                onSelectedContactsChange={setSelectedContacts}
                clickable={true}
                showNoContactsWarning={false}
                warningMessage="Keine Kontakte gefunden. Erstellen Sie einen neuen Kontakt."
            />
        </>
    );
};

export default Contacts;
