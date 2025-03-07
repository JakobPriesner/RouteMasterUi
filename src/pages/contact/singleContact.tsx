import React, {useEffect, useState} from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Alert,
    Box,
    Button, Skeleton,
    Typography,
    Breadcrumbs
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { LoadingButton } from "@mui/lab";
import {Contact} from "../../types/ContactsTypes";
import {AdvancedMarker, APIProvider, Map} from "@vis.gl/react-google-maps";
import {ContactsStore} from "../../stores/ContactsStore";
import AddressAutocomplete from "../../components/address/addressAutocomplete";
import EditContactFields from "../../components/contacts/editContactFields";
import {useNotifications} from "@toolpad/core/useNotifications";
import { Link } from 'react-router-dom';

const SATELLITE_MAP_TYPE = 'satellite';

const env_variables = {
    GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
};

const SingleContact = () => {
    const { projectId, contactId } = useParams();
    const navigate = useNavigate();
    const notifications = useNotifications();
    const [updatingContact, setUpdatingContact] = useState<boolean>(false);
    const [googleMapError, setGoogleMapError] = useState<boolean>(false);
    const [contact, setContact] = useState<Contact | undefined>();

    useEffect(() => {
        if (!projectId || !contactId){
            return;
        }

        const subscription = ContactsStore.getContactById(projectId, contactId)
            .subscribe({
                next: contact => setContact(contact)
            });

        return () => subscription.unsubscribe();
    }, [projectId, contactId]);

    async function handleMarkerDragEnd(event: google.maps.MapMouseEvent) {
        if (!event.latLng || !event.latLng.lng() || !event.latLng.lat()) {
            return;
        }

        const contactBackup = contact;
        let localContact = contact;

        if (!localContact || !projectId || !contactId) {
            return;
        }

        localContact.address.latitude = event.latLng.lat();
        localContact.address.longitude = event.latLng.lng();

        setContact(localContact);

        await ContactsStore.updateContact(projectId, contactId, localContact)
            .catch(error => {
                console.log(error);
                setContact(contactBackup);
                notifications.show("Adresse konnte nicht geändert werden.", {
                    severity: "error",
                    autoHideDuration: 3000
                })
            });
    }

    async function handleSave() {
        if (!contact || !contactId || !projectId) {
            return;
        }

        setUpdatingContact(true);

        await ContactsStore.updateContact(projectId, contactId, contact);
        setUpdatingContact(false);
        navigate(`/projects/${projectId}/contacts`);
    }

    if (!contact || !projectId) {
        return (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, padding : 3 }}>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={6}>
                        <Skeleton variant="rounded" height={50}/>
                    </Grid>
                    <Grid size={6}>
                        <Skeleton variant="rounded" height={50}/>
                    </Grid>
                </Grid>
                <Skeleton variant="rounded" height={50}/>

                <AddressAutocomplete address={undefined} onChange={() => {}} loading={!contact}/>

                <Box sx={{ marginTop: 3, display: "flex", gap: 2 }} justifyContent={"end"}>
                    <Button variant="outlined" color="inherit" disabled>
                        Abbrechen
                    </Button>
                    <LoadingButton variant="contained" color="primary" disabled>
                        Speichern
                    </LoadingButton>
                </Box>

                <Skeleton variant="rectangular" height="50vh" />
            </Box>
        )
    }

    if (!contact) {
        return (<Alert severity={"error"}>Der Kontakt mit der ID {contactId} wurde nicht gefunden.</Alert>)
    }

    return (
        <Box sx={{ padding: 3 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link to={`/projects/${projectId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    Projekt
                </Link>
                <Link to={`/projects/${projectId}/contacts`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    Kontakte
                </Link>
                <Typography color="text.primary">
                    {contact.firstName} {contact.lastName}
                </Typography>
            </Breadcrumbs>

            <Typography variant="h4" sx={{ mb: 3 }}>
                Kontakt bearbeiten
            </Typography>

            <EditContactFields onChange={(newContact: Contact) => setContact(newContact)} projectId={projectId} contact={contact}/>

            <Box sx={{ marginTop: 3, display: "flex", gap: 2 }} justifyContent={"end"}>
                <Button variant="outlined" color="inherit" onClick={() => navigate(`/projects/${projectId}/contacts`)}>
                    Abbrechen
                </Button>
                <LoadingButton variant="contained" color="primary" onClick={handleSave} loading={updatingContact} loadingPosition={"start"}>
                    Speichern
                </LoadingButton>
            </Box>

            {contact?.address?.latitude !== undefined && contact?.address?.longitude !== undefined ? (
                <Box sx={{ height: "50vh", marginTop: 3 }}>
                    {googleMapError
                        ? <Alert severity="warning">Es gab ein Problem beim Laden der Map.</Alert>
                        : <APIProvider apiKey={env_variables.GOOGLE_MAPS_API_KEY} language="de-DE" onError={() => setGoogleMapError(true)}>
                            <Map defaultCenter={{ lat: contact.address.latitude, lng: contact.address.longitude }}
                                 defaultZoom={20}
                                 mapId={"routeMaster-EditContact"}
                                 style={{ width: "100%", height: "100%" }}
                                 gestureHandling={'greedy'}
                                 mapTypeId={SATELLITE_MAP_TYPE}
                            >
                                <AdvancedMarker position={{lat: contact.address.latitude, lng: contact.address.longitude}}
                                                draggable
                                                onDragEnd={handleMarkerDragEnd}
                                />
                            </Map>
                        </APIProvider>
                    }
                </Box>
            ) : (
                <Alert severity="warning" sx={{ marginTop: 3 }}>
                    Die Karte kann nicht angezeigt werden, da die Koordinaten für die Adresse noch nicht berechnet wurden. Falls der Kontakt gerade erst erstellt wurde, laden Sie bitte die Seite neu. Andernfalls aktualisieren Sie die Adresse, um die Position neu zu berechnen.
                </Alert>
            )}
        </Box>
    );
};

export default SingleContact;
