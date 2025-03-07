import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    TextField,
    Switch,
    FormControl,
    Select,
    MenuItem,
    ListItemText,
    Checkbox,
    Alert,
    Paper,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { Project } from "../../types/ProjectsTypes";
import { ProjectsStore } from "../../stores/ProjectsStore";
import { useNotifications } from "@toolpad/core/useNotifications";
import { Address } from "../../types/AddressTypes";
import AddressAutocomplete from "../../components/address/addressAutocomplete";
import ShortAddressTextField from "../../components/address/shortAddressTextField";
import HelpTooltip from "../../components/help/helpTooltip";
import LinearProgress from "@mui/material/LinearProgress";

type DayOfWeek =
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday'
    | 'Sunday';

const ALL_DAYS: DayOfWeek[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];

const DAY_TRANSLATIONS: Record<DayOfWeek, string> = {
    Monday: 'Montag',
    Tuesday: 'Dienstag',
    Wednesday: 'Mittwoch',
    Thursday: 'Donnerstag',
    Friday: 'Freitag',
    Saturday: 'Samstag',
    Sunday: 'Sonntag',
};

const CONTACT_FIELDS = ['Email', 'Phone', 'Address'] as const;
type ContactField = typeof CONTACT_FIELDS[number];

const CONTACT_FIELD_LABELS: Record<ContactField, string> = {
    Email: 'E-Mail',
    Phone: 'Telefon',
    Address: 'Adresse',
};

export default function ProjectSettingsPage() {
    const navigate = useNavigate();
    const notifications = useNotifications();
    const { projectId } = useParams<{ projectId: string }>();

    const [project, setProject] = useState<Project>();
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [showChangeAddress, setShowChangeAddress] = useState<boolean>(false);

    useEffect(() => {
        if (!projectId) return;

        setIsLoading(true);
        ProjectsStore.getProjectById(projectId)
            .subscribe({
                next: loadedProject => {
                    if (!loadedProject) {
                        notifications.show('Projekt wurde nicht gefunden.');
                        navigate('/projects');
                        return;
                    }
                    setProject(loadedProject);
                    setIsLoading(false);
                },
                error: err => {
                    console.error(err);
                    setLoadError('Projekt konnte nicht geladen werden.');
                    setIsLoading(false);
                }
            });
    }, [projectId, navigate, notifications]);

    const handleSave = async () => {
        if (!projectId || !project) return;
        setIsLoading(true);

        try {
            await ProjectsStore.updateProject(projectId, project);
            navigate(`/projects/${projectId}`);
        } catch (err) {
            console.error(err);
            setLoadError('Änderungen konnten nicht gespeichert werden.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNameChange = (
        e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => {
        if (!project) return;
        setProject({ ...project, name: e.target.value });
    };

    const handleCustomerIdRequiredChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (!project) return;
        setProject({ ...project, customerIdRequired: e.target.checked });
    };

    const handleDeliveryDaysChange = (event: SelectChangeEvent<string[]>) => {
        if (!project) return;
        setProject({ ...project, deliveryDays: event.target.value as string[] });
    };

    const handleContactFieldsChange = (
        event: SelectChangeEvent<ContactField[]>
    ) => {
        if (!project) return;
        setProject({
            ...project,
            contactLookupFields: event.target.value as ContactField[],
        });
    };

    const handleAddressChange = (newAddress: Address) => {
        if (!project) return;
        setProject({ ...project, depotAddress: newAddress });
        setShowChangeAddress(false);
    };

    const showCustomerIdFieldWarning =
        project?.contactLookupFields &&
        !project.customerIdRequired &&
        project.contactLookupFields.includes('CustomerId');

    if (isLoading && !project) {
        return <LinearProgress />;
    }

    if (!project) {
        return null;
    }

    return (
        <Box sx={{
            width: '100%',
            px: { xs: 2, sm: 4 },
            py: 3,
        }}>
            {loadError && (
                <Alert severity="error" sx={{ mb: 4 }} onClose={() => setLoadError(null)}>
                    {loadError}
                </Alert>
            )}

            <Paper
                sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 1,
                }}
            >
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Allgemeine Einstellungen
                </Typography>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                        Projektname
                    </Typography>
                    <TextField
                        fullWidth
                        value={project.name}
                        onChange={handleNameChange}
                        variant="outlined"
                        size="small"
                    />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Switch
                        checked={project.customerIdRequired}
                        onChange={handleCustomerIdRequiredChange}
                        color="primary"
                        sx={{
                            mr: 1,
                            '& .MuiSwitch-track': {
                                bgcolor: 'rgba(25, 25, 25, 0.6)'
                            }
                        }}
                    />
                    <Typography>Kundennummer erforderlich?</Typography>
                    <HelpTooltip
                        text={
                            'Wenn aktiviert, muss für jeden Kontakt eine Kundennummer angegeben werden. ' +
                            'Deaktiviert bedeutet, dass eine Kundennummer zwar möglich, aber nicht zwingend ist.'
                        }
                    />
                </Box>
            </Paper>

            <Paper
                sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 1,
                }}
            >
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Depot-Adresse
                </Typography>

                {!showChangeAddress ? (
                    <Box>
                        <ShortAddressTextField address={project.depotAddress} />
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => setShowChangeAddress(true)}
                        >
                            Adresse ändern
                        </Button>
                    </Box>
                ) : (
                    <AddressAutocomplete
                        address={project.depotAddress}
                        onChange={handleAddressChange}
                        loading={false}
                    />
                )}
            </Paper>

            <Box sx={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                '@media (min-width: 900px) and (max-width: 1410px)': {
                    gridTemplateColumns: '1fr'
                },
                '@media (min-width: 1411px)': {
                    gridTemplateColumns: '1fr 1fr'
                },
                gap: 3,
                mb: 3
            }}>
                <Paper
                    sx={{
                        p: 3,
                        borderRadius: 1,
                        height: '100%'
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Liefertage
                    </Typography>

                    <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                            Liefertage
                        </Typography>
                    </Box>

                    <FormControl fullWidth>
                        <Select
                            multiple
                            value={project.deliveryDays as DayOfWeek[]}
                            onChange={handleDeliveryDaysChange}
                            renderValue={(selected) =>
                                (selected as DayOfWeek[])
                                    .map((day) => DAY_TRANSLATIONS[day])
                                    .join(', ')
                            }
                            displayEmpty
                        >
                            {ALL_DAYS.map((day) => (
                                <MenuItem key={day} value={day}>
                                    <Checkbox
                                        checked={project.deliveryDays.includes(day) ?? false}
                                    />
                                    <ListItemText primary={DAY_TRANSLATIONS[day]} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Paper>

                <Paper
                    sx={{
                        p: 3,
                        borderRadius: 1,
                        height: '100%'
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Kontaktfelder
                    </Typography>

                    <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                            Kontaktfelder
                        </Typography>
                    </Box>

                    <FormControl fullWidth>
                        <Select
                            multiple
                            value={project?.contactLookupFields as ContactField[]}
                            onChange={handleContactFieldsChange}
                            renderValue={(selected) =>
                                (selected as ContactField[])
                                    .map((field) => CONTACT_FIELD_LABELS[field])
                                    .join(', ')
                            }
                            displayEmpty
                        >
                            {CONTACT_FIELDS.map((field) => (
                                <MenuItem key={field} value={field}>
                                    <Checkbox
                                        checked={project.contactLookupFields.includes(field)}
                                    />
                                    <ListItemText primary={CONTACT_FIELD_LABELS[field]} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {showCustomerIdFieldWarning && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            Du hast <strong>CustomerId</strong> als Suchfeld ausgewählt,
                            obwohl "Kunden-ID erforderlich" deaktiviert ist. Überprüfe, ob das gewünscht ist.
                        </Alert>
                    )}
                </Paper>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                    variant="outlined"
                    onClick={() => navigate(-1)}
                >
                    Abbrechen
                </Button>
                <LoadingButton
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    loading={isLoading}
                >
                    Speichern
                </LoadingButton>
            </Box>
        </Box>
    );
}
