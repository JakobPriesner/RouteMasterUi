import React, {useState} from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import {Accordion, AccordionSummary, Button, TextField, Typography} from "@mui/material";
import DialogActions from "@mui/material/DialogActions";
import Grid from "@mui/material/Grid2";
import {LocationOnRounded} from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccordionDetails from "@mui/material/AccordionDetails";
import {LoadingButton} from "@mui/lab";
import {AddVehicleRequest, VehicleType} from "../types/VehiclesTypes";
import {Address} from "../types/AddressTypes";
import { useParams } from "react-router";
import {VehiclesStore} from "../stores/VehiclesStore";
import AddressAutocomplete from "../components/address/addressAutocomplete";
import VehicleTypeSelect from "../components/vehicles/vehicleTypeSelect";
import {useNotifications} from "@toolpad/core/useNotifications";
import LicencePlate from "../components/inputs/licencePlate";

interface CreateVehicleDialogProps {
    open: boolean;
    onClose: () => void;
}

const CreateVehicleDialog : React.FC<CreateVehicleDialogProps> = ({open, onClose}) => {
    const [vehicleType, setVehicleType] = useState<VehicleType>(VehicleType.Car);
    const [imageUrl, setImageUrl] = useState<string>();
    const [alias, setAlias] = useState("");
    const [plate, setPlate] = useState("");
    const [availableLoadInKilograms, setAvailableLoadInKilograms] = useState("");
    const [parkingPosition, setParkingPosition] = useState<Address | undefined>();
    const [creating, setCreating] = useState(false);

    const notifications = useNotifications();

    const {projectId} = useParams();

    const handleSave = () => {
        if (!projectId) {
            return;
        }

        setCreating(true);

        const request: AddVehicleRequest = {
            alias: alias,
            licencePlate: plate,
            imageUrl: imageUrl,
            parkingPosition: parkingPosition,
            vehicleType: vehicleType
        };

        VehiclesStore.addVehicleToProject(projectId, request)
            .subscribe({
                next: () => {
                    notifications.show('Fahrzeug erfolgreich erstellt.', {
                        severity: 'success',
                        autoHideDuration: 3000,
                    });
                    onClose();
                    setCreating(false);
                },
                error: err => {
                    console.error(err);
                    notifications.show("Es gab ein Problem beim Erstellen des Fahrzeugs.", {
                        severity: "error",
                        autoHideDuration: 3000
                    });
                }
            });
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
            <DialogTitle>Neues Fahrzeug erstellen</DialogTitle>

            <DialogContent>
                <Box sx={{ maxHeight: 600, overflowY: "auto", p: 2 }}>
                    <Grid container spacing={2}>
                        <Grid size={12}>
                            <VehicleTypeSelect onChange={setVehicleType} multiSelect={false} size="medium" required={true}/>
                        </Grid>

                        <Grid size={{xs: 12, sm: 6}}>
                            <TextField
                                fullWidth
                                label="Name"
                                variant="outlined"
                                value={alias}
                                onChange={(e) => setAlias(e.target.value)}
                            />
                        </Grid>

                        <Grid size={{xs: 12, sm: 6}}>
                            <LicencePlate onChange={(newValue) => setPlate(newValue)} label="Kennzeichen"/>
                        </Grid>

                        <Grid size={{xs: 12}}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Verfügbare Ladung (kg)"
                                variant="outlined"
                                value={availableLoadInKilograms}
                                onChange={(e) => setAvailableLoadInKilograms(e.target.value)}
                                helperText="Die maximale Ladekapazität in Kilogramm (Optional)"
                            />
                        </Grid>

                        <Grid size={{xs: 12}}>
                            <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1-content"
                                    id="panel1-header"
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                        <LocationOnRounded sx={{ mr: 1 }} />
                                        <Typography>Parkposition (Optional)</Typography>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <AddressAutocomplete loading={false}
                                                         address={parkingPosition}
                                                         onChange={(newAddress) => setParkingPosition(newAddress)}/>
                                </AccordionDetails>
                            </Accordion>
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={() => onClose()} color="inherit">
                    Abbrechen
                </Button>
                <LoadingButton loading={creating} onClick={() => handleSave()} variant="contained" color="primary">
                    Speichern
                </LoadingButton>
            </DialogActions>
        </Dialog>
    )
}

export default CreateVehicleDialog;
