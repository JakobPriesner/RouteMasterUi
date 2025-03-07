import React, {useState} from "react";
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {AddContactRequest, Contact} from "../types/ContactsTypes";
import {ContactsStore} from "../stores/ContactsStore";
import EditContactFields from "../components/contacts/editContactFields";

interface CreateContactDialogProps {
    open: boolean;
    onClose: () => void;
    projectId: string;
}

const CreateContactDialog: React.FC<CreateContactDialogProps> = ({ open, onClose, projectId }) => {
    const [contact, setContact] = useState<Contact>({
        id: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        customerId: undefined,
        address: {
            street: "",
            city: "",
            houseNumber: "",
            zip: 0,
            note: ""
        },
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    async function handleSubmit(){
        if (!projectId) {
            setError("Project ID fehlt.");
            return;
        }

        if (!contact.firstName || !contact.lastName) {
            setError("Vor - und Nachname sind notwendig.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const addContactRequest: AddContactRequest = {
                firstName: contact.firstName,
                lastName: contact.lastName,
                email: contact.email,
                phone: contact.phone,
                customerId: contact.customerId,
                address: contact.address,
            }
            await ContactsStore.addContact(projectId, addContactRequest);
            onClose();
            resetContact()
        } catch (err) {
            setError(`Kontakt konnte nicht erstellt werden.\n${err}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    function resetContact() {
        setContact({
            id: "",
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            customerId: undefined,
            address: {
                street: "",
                city: "",
                houseNumber: "",
                zip: -1,
                note: ""
            },
        });
    }

    function handleClose() {
        if (!loading) {
            onClose();
            resetContact()
            setError("");
        }
    }

    return (
        <Dialog open={open} onClose={handleClose} fullWidth>
            <DialogTitle>Neuen Kontakt erstellen</DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    {error && <Alert severity="error">{error}</Alert>}
                    <EditContactFields contact={contact} onChange={(c) => {
                        setContact(c);
                    }} projectId={projectId} />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="inherit" disabled={loading}>
                    Abbrechen
                </Button>
                <LoadingButton
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    loading={loading}
                >
                    Erstellen
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
};

export default CreateContactDialog;
