import React, {useState, useMemo, useEffect} from 'react';
import {
    Box,
    Button,
    Typography,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    FormControlLabel,
    Switch,
    Alert,
    Checkbox,
    ListItemText,
    OutlinedInput,
    Stack,
    Paper, Slide
} from '@mui/material';
import ShortAddressTextField from "../components/address/shortAddressTextField";
import {LoadingButton} from "@mui/lab";
import Dialog from "@mui/material/Dialog";
import {useNavigate} from "react-router-dom";
import {AddProjectRequest} from "../types/ProjectsTypes";
import {ProjectsStore} from "../stores/ProjectsStore";
import { TransitionProps } from '@mui/material/transitions';
import {BillingToken} from "../types/BillingTypes";
import HelpTooltip from "../components/help/helpTooltip";
import AddressAutocomplete from "../components/address/addressAutocomplete";
import {UsersStore} from "../stores/UsersStore";
import { User } from '../types/UsersTypes';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children: React.ReactElement },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="left" ref={ref} {...props} />;
});

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
    'Sunday'
];

const DAY_TRANSLATIONS: Record<DayOfWeek, string> = {
    Monday: 'Montag',
    Tuesday: 'Dienstag',
    Wednesday: 'Mittwoch',
    Thursday: 'Donnerstag',
    Friday: 'Freitag',
    Saturday: 'Samstag',
    Sunday: 'Sonntag'
};

const CONTACT_FIELD_LABELS: Record<ContactField, string> = {
    CustomerId: 'Kundennummer',
    Email: 'E-Mail',
    Phone: 'Telefon',
    Address: 'Adresse'
};


const CONTACT_FIELDS = ['CustomerId', 'Email', 'Phone', 'Address'] as const;
type ContactField = typeof CONTACT_FIELDS[number];

interface ProjectCreationWizardProps {
    open: boolean;
    onClose: () => void;
}

// ----------------------------------------------------------------------------------
// Schritt 0: Willkommensseite
// ----------------------------------------------------------------------------------
function StepWelcome(props: {
    loading: boolean;
    onNext: () => void;
    onCancel: () => void;
}) {
    const { onNext, onCancel } = props;

    return (
        <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
                Willkommen bei RouteMaster
            </Typography>
            <Typography variant="body1" gutterBottom>
                Es sieht so aus, als hättest du noch keine Projekte.
                RouteMaster ist ein Liefermanagement‐Tool, das Unternehmen bei der Planung
                und Ausführung von Transportaufträgen unterstützt. Lass uns dein erstes Projekt anlegen!
            </Typography>
            <Box mt={2}>
                <Button variant="contained" color="primary" onClick={onNext}>
                    Legen wir los
                </Button>
                <Button sx={{ ml: 2 }} onClick={onCancel}>
                    Abbrechen
                </Button>
            </Box>
        </Paper>
    );
}

// ----------------------------------------------------------------------------------
// Schritt 1: Abrechnungstoken wählen
// ----------------------------------------------------------------------------------
function StepBillingToken(props: {
    loading: boolean;
    billingTokens: BillingToken[];
    selectedBillingToken: string;
    onChangeBillingToken: (token: string) => void;
    onNext: () => void;
    onCancel: () => void;
}) {
    const {
        loading,
        billingTokens,
        selectedBillingToken,
        onChangeBillingToken,
        onNext,
        onCancel
    } = props;

    const usableTokens = useMemo(
        () => billingTokens.filter(t => !t.regardingProjectId),
        [billingTokens]
    );

    return (
        <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
                Abrechnungstoken auswählen
            </Typography>
            <Typography variant="body2" gutterBottom>
                Bitte wähle einen verfügbaren Abrechnungstoken aus, der mit deinem neuen Projekt verknüpft werden soll.
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="billing-token-label">Abrechnungstoken</InputLabel>
                <Select
                    labelId="billing-token-label"
                    label="Abrechnungstoken"
                    value={selectedBillingToken}
                    onChange={(e) => onChangeBillingToken(e.target.value as string)}
                >
                    {usableTokens.length === 0 && (
                        <MenuItem disabled value="">
                            Keine gültigen Abrechnungstokens verfügbar
                        </MenuItem>
                    )}
                    {usableTokens.map(token => (
                        <MenuItem key={token.token} value={token.token} disabled={token.regardingProjectId.length > 0}>
                            {token.plan} ({token.token})
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Box mt={4}>
                <LoadingButton
                    loading={loading}
                    onClick={onNext}
                    variant="contained"
                    color="primary"
                    disabled={!selectedBillingToken}
                >
                    Weiter
                </LoadingButton>
                <LoadingButton loading={loading} sx={{ ml: 2 }} onClick={onCancel}>
                    Abbrechen
                </LoadingButton>
            </Box>
        </Paper>
    );
}

// ----------------------------------------------------------------------------------
// Schritt 2: Projekteinstellungen (Projektname & Customer‐ID‐Pflicht)
// ----------------------------------------------------------------------------------
function StepProjectSettings(props: {
    loading: boolean;
    projectName: string;
    onChangeProjectName: (name: string) => void;
    customerIdRequired: boolean;
    onToggleCustomerIdRequired: () => void;
    onBack: () => void;
    onNext: () => void;
}) {
    const {
        loading,
        projectName,
        onChangeProjectName,
        customerIdRequired,
        onToggleCustomerIdRequired,
        onBack,
        onNext
    } = props;

    return (
        <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
                Projekteinstellungen
            </Typography>
            <TextField
                label="Projektname"
                fullWidth
                sx={{ mt: 2 }}
                value={projectName}
                onChange={(e) => onChangeProjectName(e.target.value)}
            />
            <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
                <FormControlLabel
                    sx={{ mt: 2 }}
                    control={
                        <Switch
                            checked={customerIdRequired}
                            onChange={onToggleCustomerIdRequired}
                        />
                    }
                    label="Kundennummer erforderlich?"
                />
                <HelpTooltip
                    text={
                        "Wenn aktiviert, muss für jeden Kontakt eine Kundennummer angegeben werden. Dies ist nützlich, wenn man Kontakte schnell im eigenen System finden möchte. Ist die Option deaktiviert, kann eine Kundennummer dennoch angegeben werden, dies ist allerdings nicht erforderlich."
                    }
                />
            </div>
            <Box mt={4}>
                <Stack direction="row" spacing={2}>
                    <LoadingButton loading={loading} variant="outlined" onClick={onBack}>
                        Zurück
                    </LoadingButton>
                    <LoadingButton
                        loading={loading}
                        onClick={onNext}
                        variant="contained"
                        color="primary"
                        disabled={!projectName.trim()}
                    >
                        Weiter
                    </LoadingButton>
                </Stack>
            </Box>
        </Paper>
    );
}

// ----------------------------------------------------------------------------------
// Schritt 3: Depot‐Adresse
// ----------------------------------------------------------------------------------
function StepDepotAddress(props: {
    loading: boolean;
    address: any;
    onChangeAddress: (addr: any) => void;
    onBack: () => void;
    onNext: () => void;
}) {
    const { loading, address, onChangeAddress, onBack, onNext } = props;

    return (
        <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
                Depot‐Adresse
            </Typography>
            <Typography variant="body2" gutterBottom>
                Gib hier die Hauptadresse (Depot) an, von der Lieferungen abgeholt werden.
            </Typography>
            <Box mt={2}>
                <AddressAutocomplete onChange={onChangeAddress} loading={false} />
            </Box>
            <Box mt={4}>
                <Stack direction="row" spacing={2}>
                    <LoadingButton loading={loading} variant="outlined" onClick={onBack}>
                        Zurück
                    </LoadingButton>
                    <LoadingButton
                        loading={loading}
                        onClick={onNext}
                        variant="contained"
                        color="primary"
                        disabled={!address}
                    >
                        Weiter
                    </LoadingButton>
                </Stack>
            </Box>
        </Paper>
    );
}

// ----------------------------------------------------------------------------------
// Schritt 4: DeliveryDays
// ----------------------------------------------------------------------------------
function StepDeliveryDays(props: {
    loading: boolean;
    deliveryDays: DayOfWeek[];
    onChangeDeliveryDays: (days: DayOfWeek[]) => void;
    onBack: () => void;
    onNext: () => void;
}) {
    const { loading, deliveryDays, onChangeDeliveryDays, onBack, onNext } = props;

    return (
        <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
                Liefertage
            </Typography>
            <Typography variant="body2" gutterBottom>
                Wähle hier die Wochentage aus, an denen dein Unternehmen liefert.
            </Typography>
            <Stack direction="row" spacing={2} sx={{ my: 2 }}>
                <Button variant="outlined" onClick={() => onChangeDeliveryDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])}>
                    Wochentage
                </Button>
                <Button variant="outlined" onClick={() => onChangeDeliveryDays(['Monday', 'Wednesday', 'Friday'])}>
                    Jeden 2. Tag
                </Button>
                <Button variant="outlined" onClick={() => onChangeDeliveryDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])}>
                    Alle Tage
                </Button>
            </Stack>
            <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="delivery-days-label">Wochentage</InputLabel>
                <Select
                    labelId="delivery-days-label"
                    multiple
                    value={deliveryDays}
                    onChange={event => onChangeDeliveryDays(event.target.value as DayOfWeek[])}
                    input={<OutlinedInput label="Wochentage" />}
                    renderValue={(selected) =>
                        (selected as DayOfWeek[])
                            .map((day) => DAY_TRANSLATIONS[day])
                            .join(', ')
                    }
                >
                    {ALL_DAYS.map((day) => (
                        <MenuItem key={day} value={day}>
                            <Checkbox checked={deliveryDays.indexOf(day) > -1} />
                            <ListItemText primary={DAY_TRANSLATIONS[day]} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Box mt={4}>
                <Stack direction="row" spacing={2}>
                    <LoadingButton loading={loading} variant="outlined" onClick={onBack}>
                        Zurück
                    </LoadingButton>
                    <LoadingButton
                        loading={loading}
                        onClick={onNext}
                        variant="contained"
                        color="primary"
                    >
                        Weiter
                    </LoadingButton>
                </Stack>
            </Box>
        </Paper>
    );
}


// ----------------------------------------------------------------------------------
// Schritt 5: Kontakt‐Suchfelder
// ----------------------------------------------------------------------------------
function StepContactLookupFields(props: {
    loading: boolean;
    customerIdRequired: boolean;
    selectedFields: ContactField[];
    onChangeSelectedFields: (fields: ContactField[]) => void;
    onBack: () => void;
    onNext: () => void;
}) {
    const {
        loading,
        customerIdRequired,
        selectedFields,
        onChangeSelectedFields,
        onBack,
        onNext
    } = props;

    const showCustomerIdFieldWarning = !customerIdRequired && selectedFields.includes('CustomerId');

    return (
        <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
                Kontakt‐Suchfelder
            </Typography>
            <Typography variant="body2" gutterBottom>
                Wähle aus, welche Felder angezeigt werden sollen, wenn du nach einem Kontakt suchst.
            </Typography>
            {showCustomerIdFieldWarning && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                    Du hast <strong>CustomerId</strong> als Suchfeld ausgewählt,
                    aber &quot;Kunden‐ID erforderlich&quot; ist ausgeschaltet.
                    Du kannst das hier ändern oder trotzdem fortfahren.
                </Alert>
            )}
            <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="contact-fields-label">Kontaktfelder</InputLabel>
                <Select
                    labelId="contact-fields-label"
                    multiple
                    value={selectedFields}
                    onChange={event => onChangeSelectedFields(event.target.value as ContactField[])}
                    input={<OutlinedInput label="Kontaktfelder" />}
                    renderValue={(selected) =>
                        (selected as ContactField[])
                            .map((field) => CONTACT_FIELD_LABELS[field])
                            .join(', ')
                    }
                >
                    {CONTACT_FIELDS.map((field) => (
                        <MenuItem key={field} value={field}>
                            <Checkbox checked={selectedFields.indexOf(field) > -1} />
                            <ListItemText primary={CONTACT_FIELD_LABELS[field]} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Box mt={4}>
                <Stack direction="row" spacing={2}>
                    <LoadingButton loading={loading} variant="outlined" onClick={onBack}>
                        Zurück
                    </LoadingButton>
                    <LoadingButton
                        loading={loading}
                        onClick={onNext}
                        variant="contained"
                        color="primary"
                    >
                        Weiter
                    </LoadingButton>
                </Stack>
            </Box>
        </Paper>
    );
}


// ----------------------------------------------------------------------------------
// Schritt 6: Zusammenfassung & Erstellung
// ----------------------------------------------------------------------------------
function StepReviewAndCreate(props: {
    loading: boolean;
    billingToken: string;
    projectName: string;
    customerIdRequired: boolean;
    address: any;
    deliveryDays: DayOfWeek[];
    selectedFields: ContactField[];
    onBack: () => void;
    onFinish: () => void;
}) {
    const {
        loading,
        billingToken,
        projectName,
        customerIdRequired,
        address,
        deliveryDays,
        selectedFields,
        onBack,
        onFinish
    } = props;

    return (
        <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
                Überprüfen & Erstellen
            </Typography>
            <Typography variant="body2">
                Bitte überprüfe deine Einstellungen und klicke auf &quot;Projekt erstellen&quot;, sobald du fertig bist.
            </Typography>
            <Box mt={2}>
                <Typography variant="subtitle1">
                    <strong>Abrechnungstoken:</strong> {billingToken}
                </Typography>
                <Typography variant="subtitle1">
                    <strong>Projektname:</strong> {projectName}
                </Typography>
                <Typography variant="subtitle1">
                    <strong>Kunden‐ID erforderlich:</strong> {customerIdRequired ? 'Ja' : 'Nein'}
                </Typography>
                <Typography variant="subtitle1">
                    <strong>Depot‐Adresse:</strong>{' '}
                    {address ? <ShortAddressTextField address={address} /> : '(keine)'}
                </Typography>
                <Typography variant="subtitle1">
                    <strong>Liefertage:</strong> {deliveryDays.map((day) => DAY_TRANSLATIONS[day]).join(', ')}
                </Typography>
                <Typography variant="subtitle1">
                    <strong>Kontakt‐Suchfelder:</strong> {selectedFields.map((field) => CONTACT_FIELD_LABELS[field]).join(', ')}
                </Typography>
            </Box>
            <Box mt={4}>
                <Stack direction="row" spacing={2}>
                    <LoadingButton loading={loading} variant="outlined" onClick={onBack}>
                        Zurück
                    </LoadingButton>
                    <LoadingButton loading={loading} variant="contained" color="primary" onClick={onFinish}>
                        Projekt erstellen
                    </LoadingButton>
                </Stack>
            </Box>
        </Paper>
    );
}

// ----------------------------------------------------------------------------------
// Haupt‐Wizard
// ----------------------------------------------------------------------------------
export default function ProjectCreationWizard(props: ProjectCreationWizardProps) {
    let { open, onClose } = props;
    const navigate = useNavigate();

    const [step, setStep] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [user, setUser] = useState<User>();
    const [selectedBillingToken, setSelectedBillingToken] = useState('');
    const [projectName, setProjectName] = useState('');
    const [customerIdRequired, setCustomerIdRequired] = useState(true);
    const [address, setAddress] = useState<any>(null);
    const [deliveryDays, setDeliveryDays] = useState<DayOfWeek[]>([]);
    const [selectedContactFields, setSelectedContactFields] = useState<ContactField[]>([]);

    useEffect(() => {
        const subscription = UsersStore.getCurrentUser().subscribe(user => {
            setUser(user);
            if (user?.projects.length ?? 0 > 0) {
                setStep(1);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Navigation
    const handleNext = () => setStep((prev) => prev + 1);
    const handleBack = () => setStep((prev) => prev - 1);

    const handleFinish = () => {
        const data: AddProjectRequest = {
            name: projectName,
            description: "",
            token: selectedBillingToken,
            customerIdRequired: customerIdRequired,
            defaultPickupDurationInMinutes: 5,
            depotAddress: address,
            deliveryDays: deliveryDays,
            contactLookupFields: selectedContactFields
        };

        setIsLoading(true);
        ProjectsStore.addProject(data).then((projectId) => {
            setIsLoading(false);
            navigate(`/projects/${projectId}`);
        });
    };

    function renderContent() {
        if (step === 0) {
            return (
                <StepWelcome
                    loading={isLoading}
                    onNext={handleNext}
                    onCancel={onClose}
                />
            );
        }

        if (step === 1) {
            return (
                <StepBillingToken
                    loading={isLoading}
                    billingTokens={user?.billingTokens ?? []}
                    selectedBillingToken={selectedBillingToken}
                    onChangeBillingToken={val => setSelectedBillingToken(val)}
                    onNext={handleNext}
                    onCancel={onClose}
                />
            );
        }

        if (step === 2) {
            return (
                <StepProjectSettings
                    loading={isLoading}
                    projectName={projectName}
                    onChangeProjectName={val => setProjectName(val)}
                    customerIdRequired={customerIdRequired}
                    onToggleCustomerIdRequired={() => setCustomerIdRequired(prev => !prev)}
                    onBack={handleBack}
                    onNext={handleNext}
                />
            );
        }

        if (step === 3) {
            return (
                <StepDepotAddress
                    loading={isLoading}
                    address={address}
                    onChangeAddress={val => setAddress(val)}
                    onBack={handleBack}
                    onNext={handleNext}
                />
            );
        }

        if (step === 4) {
            return (
                <StepDeliveryDays
                    loading={isLoading}
                    deliveryDays={deliveryDays}
                    onChangeDeliveryDays={val => setDeliveryDays(val)}
                    onBack={handleBack}
                    onNext={handleNext}
                />
            );
        }

        if (step === 5) {
            return (
                <StepContactLookupFields
                    loading={isLoading}
                    customerIdRequired={customerIdRequired}
                    selectedFields={selectedContactFields}
                    onChangeSelectedFields={val => setSelectedContactFields(val)}
                    onBack={handleBack}
                    onNext={handleNext}
                />
            );
        }

        if (step === 6) {
            return (
                <StepReviewAndCreate
                    loading={isLoading}
                    billingToken={selectedBillingToken}
                    projectName={projectName}
                    customerIdRequired={customerIdRequired}
                    address={address}
                    deliveryDays={deliveryDays}
                    selectedFields={selectedContactFields}
                    onBack={handleBack}
                    onFinish={handleFinish}
                />
            );
        }

        return null;
    }

    return (
        <Dialog
            fullScreen
            open={open}
            onClose={() => open = false}
            TransitionComponent={Transition}
        >
            {renderContent()}
        </Dialog>
    )
}
