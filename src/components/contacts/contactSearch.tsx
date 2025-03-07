import React, { useEffect, useRef, useState } from "react";
import { Autocomplete, Box, TextField } from "@mui/material";
import Grid from "@mui/material/Grid2";
import {Project} from "../../types/ProjectsTypes";
import {ProjectsStore} from "../../stores/ProjectsStore";
import {useParams} from "react-router";
import {ContactMinimalInfo, LookupContactsResult} from "../../types/ContactsTypes";
import {useNotifications} from "@toolpad/core/useNotifications";
import {ContactsStore} from "../../stores/ContactsStore";

interface ContactSearchProps {
    onChange(contact: ContactMinimalInfo | null): void;
}

const ContactSearch: React.FC<ContactSearchProps> = ({ onChange }) => {
    const { projectId } = useParams();
    const [project, setProject] = useState<Project | undefined>(undefined);
    const [contacts, setContacts] = useState<LookupContactsResult>({contacts: [], matchingContactsCount: 0});
    const [contactSearchText, setContactSearchText] = useState("");
    const [contactsLoading, setContactsLoading] = useState(false);
    const [contact, setContact] = useState<ContactMinimalInfo>();
    const abortControllerRef = useRef<AbortController | null>(null);
    const notifications = useNotifications();

    useEffect(() => {
        if (!projectId) {
            setProject(undefined)
            return;
        }
        const subject = ProjectsStore.getProjectById(projectId)
            .subscribe({
                next: pr => setProject(pr),
                error: err => {
                    notifications.show("Es gab ein Problem beim Laden des Projekts.", {severity: "error", autoHideDuration: 3000});
                    console.error(err);
                },
                complete: () => setContactsLoading(false)
            });

        return () => subject.unsubscribe();
    }, [projectId, notifications]);

    const handleContactSearch = async (input: string) => {
        setContactSearchText(input);
        if (!projectId || input.length < 4) {
            return;
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setContactsLoading(true);

        ContactsStore.lookupContacts(projectId, input, project?.contactLookupFields ?? [], abortControllerRef.current.signal)
            .then(result => {
                if (!result) {
                    setContacts({
                        contacts: [],
                        matchingContactsCount: 0,
                    });
                } else {
                    setContacts(result);
                }
            })
            .catch(err => {
                notifications.show("Es gab ein Problem beim Suchen nach den Kontakten.", {severity: "error", autoHideDuration: 3000});
                console.error(err);
            })
            .finally(() => setContactsLoading(false));
    };

    return (
        <Autocomplete
            options={contacts?.contacts ?? []}
            noOptionsText={
                contactSearchText.length < 4
                    ? "Bitte geben Sie mindestens 4 Buchstaben ein"
                    : "Keine Kontakte für diese Suche gefunden."
            }
            getOptionLabel={(option) => option.fullName || ""}
            loadingText={"Kontakte werden geladen..."}
            loading={contactsLoading}
            onInputChange={(_, value) => {
                handleContactSearch(value);
            }}
            onChange={(_, value) => {
                setContact(value);
                onChange(value);
            }}
            renderInput={(params) => (
                <TextField {...params} label="Kontakt" variant="outlined" required />
            )}
            renderOption={(optionProps, option) => (
                <Box component="li" {...optionProps}>
                    <Grid container gap={2} direction="row">
                        <Grid size={2}>{option.customerId}</Grid>
                        <Grid size={4}>{option.fullName}</Grid>
                        {Object.entries(option.additionalInfo).map(([key, value]) => (
                            <Grid key={key}>{String(value)}</Grid>
                        ))}
                    </Grid>
                </Box>
            )}
            value={contact}
        />
    );
};

export default ContactSearch;
