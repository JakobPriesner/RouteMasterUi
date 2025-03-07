import React, {useEffect, useState} from "react";
import Grid from "@mui/material/Grid2";
import {TextField} from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import MailRoundedIcon from "@mui/icons-material/MailRounded";
import AddressAutocomplete from "../address/addressAutocomplete";
import {Address} from "../../types/AddressTypes";
import { MuiTelInput } from "mui-tel-input";
import {Contact} from "../../types/ContactsTypes";
import {ProjectsStore} from "../../stores/ProjectsStore";

interface EditContactFieldsProps {
    contact?: Contact | null;
    onChange: (contact: Contact) => void;
    projectId: string;
}

const EditContactFields: React.FC<EditContactFieldsProps> = ({contact, onChange, projectId}) => {
    const [customerIdRequired, setCustomerIdRequired] = React.useState(false);
    const [internalContact, setInternalContact] = useState<Contact>(contact ?? {
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

    useEffect(() => {
        const subject = ProjectsStore.getProjectById(projectId).subscribe(project => setCustomerIdRequired(project?.customerIdRequired ?? false));

        return () => subject.unsubscribe();
    }, [projectId]);

    const handleChange = (field: keyof typeof internalContact) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setInternalContact({ ...internalContact, [field]: e.target.value });
        onChange(internalContact);
    };

    const handlePhoneChange = (newValue: string) => {
        setInternalContact({...internalContact, ["phone"]: newValue});
        onChange(internalContact);
    }

    const handleAddressChange = (newAddress: Address) => {
        internalContact.address = newAddress;
        setInternalContact(internalContact);
        onChange(internalContact);
    };

    return (
        <>
            <Grid container spacing={2}>
                <Grid size={{xs: 12, sm: 6}}>
                    <TextField
                        label="Vorname"
                        value={internalContact.firstName}
                        onChange={handleChange("firstName")}
                        fullWidth
                        required
                    />
                </Grid>
                <Grid size={{xs: 12, sm: 6}}>
                    <TextField
                        label="Nachname"
                        value={internalContact.lastName}
                        onChange={handleChange("lastName")}
                        fullWidth
                        required
                    />
                </Grid>
                <Grid size={{xs: 12, sm: 6}}>
                    <TextField
                        label="Email"
                        value={internalContact.email}
                        onChange={handleChange("email")}
                        fullWidth
                        type="email"
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <MailRoundedIcon />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                </Grid>
                <Grid size={{xs: 12, sm: 6}}>
                    <MuiTelInput
                        label="Telefonnummer"
                        value={internalContact.phone}
                        onChange={handlePhoneChange}
                        translate={"yes"}
                        spellCheck={true}
                        fullWidth
                        defaultCountry={"DE"}
                    />
                </Grid>
                <Grid size={12}>
                    <TextField
                        label="Kundennummer"
                        required={customerIdRequired}
                        value={internalContact.customerId}
                        onChange={handleChange("customerId")}
                        fullWidth
                    />
                </Grid>
            </Grid>
            <AddressAutocomplete
                address={internalContact.address}
                onChange={(address: Address) => handleAddressChange(address)}
                loading={false}
            />
        </>
    );
}

export default EditContactFields;
