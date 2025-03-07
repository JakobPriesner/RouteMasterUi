import React, {useRef, useState} from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    IconButton,
    FormHelperText, Switch, Fab
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Grid from "@mui/material/Grid2";
import {TimeField} from "@mui/x-date-pickers";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import TimeWindows from "../components/time-windows/timeWindows";
import {LoadingButton} from "@mui/lab";
import {formatInTimeZone, toZonedTime} from "date-fns-tz";
import { useParams } from 'react-router';
import {AddJobRequest, TimeWindow } from '../types/JobTypes';
import {ContactMinimalInfo} from "../types/ContactsTypes";
import {Address} from "../types/AddressTypes";
import {JobsStore} from "../stores/JobsStore";
import ContactSearch from "../components/contacts/contactSearch";
import HelpTooltip from "../components/help/helpTooltip";
import CreateEntryButton from "../components/buttons/createEntryButton";
import AddressAutocomplete from "../components/address/addressAutocomplete";
import {useNotifications} from "@toolpad/core/useNotifications";
import {format} from "date-fns";

interface CreateJobDialogProps {
    open: boolean;
    onClose: () => void;
}

const CreateJobDialog: React.FC<CreateJobDialogProps> = ({open, onClose}) => {
    const { projectId } = useParams();

    const timeWindowStartRef = useRef<any | undefined>(undefined);

    const [contact, setContact] = useState<ContactMinimalInfo | null>(null);
    const [description, setDescription] = useState('');
    const [onDate, setOnDate] = useState<Date | null>();
    const [priority, setPriority] = useState(0);
    const [timeLimit, setTimeLimit] = useState<number | undefined>(undefined);
    const [notes, setNotes] = useState('');

    const [timeWindows, setTimeWindows] = useState<TimeWindow[]>([]);
    const [currentTimeWindowStart, setCurrentTimeWindowStart] = useState<Date | null>();
    const [currentTimeWindowEnd, setCurrentTimeWindowEnd] = useState<Date | null>();

    const [pickupAddress, setPickupAddress] = useState<Address | undefined>(undefined);
    const [showPickup, setShowPickup] = useState(false);

    const [submitting, setSubmitting] = useState(false);

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const notifications = useNotifications();

    const close = () => {
        setContact(null);
        setDescription('');
        setOnDate(null);
        setPriority(0);
        setTimeLimit(undefined);
        setNotes('');
        setTimeWindows([]);
        setCurrentTimeWindowStart(null);
        setCurrentTimeWindowEnd(null);
        setPickupAddress(undefined);
        setShowPickup(false);

        onClose();
    };

    const toTimeWindow = (start: Date, end: Date) => {
        const timeWindow: TimeWindow = {
            startTime: formatInTimeZone(start, "UTC", "HH:mm:ss"),
            endTime: formatInTimeZone(end, "UTC", "HH:mm:ss")
        };
        return timeWindow;
    }

    const addTimeWindow = () => {
        if (currentTimeWindowStart && currentTimeWindowEnd) {
            setTimeWindows([...timeWindows, toTimeWindow(currentTimeWindowStart, currentTimeWindowEnd)]);
            setCurrentTimeWindowStart(null);
            setCurrentTimeWindowEnd(null);
        }
    };

    const handleCreate = async () => {
        if (!projectId){
            return;
        }

        if (!contact){
            notifications.show("Wähle ein Datum aus.", {
                severity: "error",
                autoHideDuration: 3000
            });
            return;
        }

        if (!onDate){
            notifications.show("Wähle ein Datum aus.", {
                severity: "error",
                autoHideDuration: 3000
            });
            return;
        }

        const request: AddJobRequest = {
            contactId: contact.id,
            description,
            onDate: format(onDate, "yyyy-MM-dd"),
            priority,
            timeLimitBetweenPickupAndDelivery: timeLimit,
            notes,
            timeWindows,
            pickUp: pickupAddress
        };

        if (showPickup && pickupAddress) {
            request.pickUp = pickupAddress;
        }

        setSubmitting(true);
        JobsStore.addJob(projectId, request)
            .finally(() => {
                setSubmitting(false);
                close();
            });
    };

    return (
        <Dialog open={open}
                onClose={close}
                fullWidth
                draggable={true}
                maxWidth="xl"
                scroll="paper"
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                Neuen Auftrag erstellen
                <IconButton onClick={close} aria-label="close"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Typography variant="h6" gutterBottom>Grundlegende Informationen</Typography>
                <Grid container spacing={2}>
                    <Grid size={{xs: 12}}>
                        <ContactSearch onChange={(contact: ContactMinimalInfo) => setContact(contact)} />
                    </Grid>
                    <Grid size={{xs: 12, sm: 6}}>
                        <DatePicker
                            label="Datum"
                            value={onDate}
                            onChange={(newVal) => setOnDate(newVal)}
                            slotProps={{ textField: { fullWidth: true, required: true } }}
                            format="dd.MM.yyyy"
                        />
                    </Grid>
                    <Grid size={{xs: 12, sm: 6}}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Zeitlimit (in Minuten)"
                            value={timeLimit ?? ''}
                            onChange={(e) => setTimeLimit(e.target.value ? parseInt(e.target.value) : undefined)}
                            variant="outlined"
                            helperText="Zeitspanne, innerhalb derer die Lieferung nach der Abholung spätestens übergeben werden muss, z.B. bei Kühlware."
                        />
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid size={12}>
                            <Switch checked={showPickup} onChange={(_, newValue) => setShowPickup(newValue)} />
                            Lieferung hat einen expliziten Abholort
                            <HelpTooltip text={"Der Abholort ist die Adresse, an der die Lieferung abgeholt wird. Dieser wird in der Routenplanung optimal berücksichtigt. Wenn keine Adresse angegeben wird, wird automatisch die Standardadresse des Projekts verwendet."} />
                        </Grid>

                        {
                            showPickup
                                ? (<Grid size={12}>
                                    <AddressAutocomplete
                                        onChange={(addr) => setPickupAddress(addr)}
                                        loading={false}
                                    />
                                </Grid>)
                                : <></>

                        }
                    </Grid>

                    <Grid size={{xs: 12}}>
                        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                            <Grid size={12}>
                                <Typography variant="h6" gutterBottom>Zeitfenster</Typography>
                                <FormHelperText>Wenn Zeitfenster angegeben sind, wird gewährleistet, dass die Lieferung innerhalb dieser erfolgt.</FormHelperText>
                            </Grid>
                            <Grid size={{xs: 12, sm: 'grow'}}>
                                <TimeField label="Von"
                                           id="TimeWindowStartInput"
                                           value={currentTimeWindowStart}
                                           onChange={(date) => setCurrentTimeWindowStart(date ? toZonedTime(date, userTimeZone) : null)}
                                           format="HH:mm"
                                           fullWidth
                                           inputRef={timeWindowStartRef}
                                />
                            </Grid>
                            <Grid size={{xs: 12, sm: 'grow'}}>
                                <TimeField label="Bis" value={currentTimeWindowEnd}
                                           onChange={(date) => setCurrentTimeWindowEnd(date ? toZonedTime(date, userTimeZone) : null)}
                                           format="HH:mm"
                                           fullWidth
                                           onKeyDown={(e) => {
                                               if (e.key === 'Enter') {
                                                   addTimeWindow();
                                                   if (timeWindowStartRef.current) {
                                                       timeWindowStartRef.current.focus();
                                                   }
                                               }
                                           }}
                                />
                            </Grid>
                            <Grid size={1} sx={{display: {xs: 'none', sm: 'block'}}} justifyContent={"end"}>
                                <Fab size="medium" color="primary" aria-label="add" onClick={addTimeWindow}>
                                    <AddRoundedIcon />
                                </Fab>
                            </Grid>
                            <Grid size={12} sx={{display: {xs: 'block', sm: 'none'}}}>
                                <CreateEntryButton onClick={addTimeWindow} />
                            </Grid>
                        </Grid>
                        <TimeWindows timeWindows={timeWindows} deletable={true} onDelete={function (timeWindow: TimeWindow): void {
                            setTimeWindows(timeWindows.filter(tw => !(tw.startTime == timeWindow.startTime && tw.endTime == timeWindow.endTime)));
                        }} />
                    </Grid>

                    <Grid container spacing={2} size={12} alignItems="center">
                        <Grid size={12}>
                            <Typography variant="h6" gutterBottom>Notizen</Typography>
                        </Grid>
                        <TextField
                            fullWidth
                            label="Notizen"
                            multiline
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            variant="outlined"
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => close()} color="inherit" disabled={submitting}>Abbrechen</Button>
                <LoadingButton onClick={() => handleCreate()} variant="contained" loading={submitting}>Erstellen</LoadingButton>
            </DialogActions>
        </Dialog>
    );
};


export default CreateJobDialog;
