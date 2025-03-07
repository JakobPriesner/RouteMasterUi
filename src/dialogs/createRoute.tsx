import React, {useState} from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import {Alert, Button, Tooltip} from "@mui/material";
import {LoadingButton} from "@mui/lab";
import DialogTitle from "@mui/material/DialogTitle";
import VehiclesTable from "../components/vehicles/vehiclesTable";
import Grid from "@mui/material/Grid2";
import JobsTable from "../components/jobs/jobTable";
import {JobState} from "../types/JobTypes";
import {CreateRouteRequest} from "../types/RoutesTypes";
import {RoutesStore} from "../stores/RoutesStore";
import {useParams} from "react-router";
import { Vehicle } from "../types/VehiclesTypes";

interface CreateRouteDialogProps {
    open: boolean;
    onClose: () => void;
    initialSelectedJobs: string[];
    initialJobFromDate?: Date,
    initialJobDueDate?: Date,
    onRouteCreated?: (routeId: string) => void; // New callback for when a route is created
}

const ONE_DAY = 24 * 60 * 60 * 1000;

const CreateRouteDialog: React.FC<CreateRouteDialogProps> = ({
                                                                 open,
                                                                 onClose,
                                                                 initialSelectedJobs = [],
                                                                 initialJobFromDate,
                                                                 initialJobDueDate,
                                                                 onRouteCreated
                                                             }) => {
    const { projectId } = useParams();
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedJobIds, setSelectedJobIds] = useState<string[]>(initialSelectedJobs);
    const [selectedVehicles, setSelectedVehicles] = useState<Vehicle[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>();

    const handleSubmit = () => {
        if (!projectId) {
            setErrorMessage("Kein Projekt ausgewählt.");
            return;
        }

        if (selectedVehicles.length === 0) {
            setErrorMessage("Kein Fahrzeug ausgewählt.");
            return;
        }

        if (selectedVehicles.length > 1) {
            setErrorMessage("Zu viele Fahrzeuge ausgewählt.");
            return;
        }

        if (selectedJobIds.length === 0) {
            setErrorMessage("Keine Aufträge ausgewählt.");
            return;
        }

        setLoading(true);

        const request: CreateRouteRequest = {
            jobIds: selectedJobIds,
            vehicleId: selectedVehicles[0].id,
        }

        RoutesStore.createRoute(projectId, request)
            .then((routeId) => {
                setLoading(false);
                // Call the callback with the new route ID
                if (onRouteCreated) {
                    onRouteCreated(routeId);
                }
                handleClose();
            })
            .catch((error) => {
                setLoading(false);
                setErrorMessage("Fehler beim Erstellen der Route: " + error.message);
            });
    }

    const handleClose = () => {
        setErrorMessage(undefined);
        onClose();
    }

    function getTooltipText() {
        if (selectedJobIds.length === 0){
            return ('Wähle zuerst mindestens eine Aufgabe aus');
        }

        if (selectedVehicles.length === 0){
            return ('Wähle zuerst mindestens ein Fahrzeug aus');
        }

        return ('');
    }

    return (
        <Dialog open={open}
                onClose={handleClose}
                maxWidth="lg">
            <DialogTitle>Neue Route erstellen</DialogTitle>
            <DialogContent>
                <Grid container direction="column" spacing={5}>
                    <Grid container direction="column" spacing={2}>
                        <span>Wähle alle Aufträge aus, die in dieser Route beliefert werden sollen.</span>

                        <JobsTable onUpdate={(selectedJobs: string[]) => setSelectedJobIds(selectedJobs)}
                                   initialStateFilter={[JobState.pending, JobState.cancelled]}
                                   initialFromDate={initialJobFromDate ?? new Date(Date.now())}
                                   initialToDate={initialJobDueDate ?? new Date(Date.now() + 7 * ONE_DAY)}
                                   selectable={true}
                                   showDateFilter={true}
                                   showStateFilter={true}/>
                    </Grid>
                    <Grid container direction="column" spacing={2}>
                        <span>Wähle nun ein Fahrzeug aus, mit welchem die Route gefahren werden soll. Wenn keins ausgewählt ist, wird automatisch das Fahrzeug genommen, welches am besten für diese Fahrt geeignet ist. (Die Berechnung beachtet dabei unter anderem Kosten für das Fahrzeug, Verrauch usw.)</span>

                        <VehiclesTable selectable={true}
                                       onUpdate={(selectedVehicles) => setSelectedVehicles(selectedVehicles)} />
                    </Grid>
                </Grid>
            </DialogContent>
            {errorMessage && (
                <Alert severity="error">
                    {errorMessage}
                </Alert>
            )}
            <DialogActions>
                <Button onClick={() => handleClose()} color="inherit" disabled={loading}>
                    Abbrechen
                </Button>
                <Tooltip title={getTooltipText()}>
                    <span>
                        <LoadingButton
                            onClick={() => handleSubmit()}
                            variant="contained"
                            color="primary"
                            loading={loading}
                            disabled={selectedJobIds.length === 0 || selectedVehicles.length === 0 || (errorMessage?.length ?? 0) > 0}
                        >
                        Erstellen
                    </LoadingButton>
                    </span>
                </Tooltip>
            </DialogActions>
        </Dialog>
    );
}

export default CreateRouteDialog;
