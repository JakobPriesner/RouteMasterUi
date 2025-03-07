import React, { FC, useEffect, useRef, useState, ChangeEvent } from 'react';
import { TextField, Autocomplete, Skeleton, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Address } from '../../types/AddressTypes';
import { PlaceSearchResult } from '../../types/GooglePlacesTypes';
import { googlePlacesStore } from '../../stores/GooglePlacesStore';
import {useNotifications} from "@toolpad/core/useNotifications";

interface AddressAutocompleteProps {
    onChange?: (address: Address) => void;
    address?: Address;
    loading: boolean;
}

const defaultAddress: Address = {
    street: '',
    houseNumber: '',
    city: '',
    zip: 0,
    note: '',
};

const AddressAutocomplete: FC<AddressAutocompleteProps> = ({ onChange, address, loading }) => {
    const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
    const [internalLoading, setInternalLoading] = useState<boolean>(false);
    const [addressState, setAddressState] = useState<Address>(address ?? defaultAddress);
    const [streetTouched, setStreetTouched] = useState(false);
    const [houseNumberTouched, setHouseNumberTouched] = useState(false);
    const [zipTouched, setZipTouched] = useState(false);
    const [cityTouched, setCityTouched] = useState(false);

    const notifications = useNotifications();
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        return () => {
            abortControllerRef.current?.abort();
        };
    }, []);

    const validateStreet = (value: string): string | null => {
        if (!streetTouched) return null;
        if (!value) return 'Straße ist erforderlich';
        if (value.length < 2) return 'Straße muss mindestens 2 Zeichen lang sein';
        return null;
    };

    const validateHouseNumber = (value: string): string | null => {
        if (!houseNumberTouched) return null;
        if (!value) return 'Hausnummer ist erforderlich';
        return null;
    };

    const validateZip = (value: number): string | null => {
        if (!zipTouched) return null;
        if (!value) return 'PLZ ist erforderlich';
        if (value < 1000 || value > 99999) return 'PLZ muss zwischen 1000 und 99999 liegen';
        return null;
    };

    const validateCity = (value: string): string | null => {
        if (!cityTouched) return null;
        if (!value) return 'Stadt ist erforderlich';
        if (value.length < 2) return 'Stadt muss mindestens 2 Zeichen lang sein';
        return null;
    };

    const handleSearchPlaces = async (query: string) => {
        if (!query || query.trim().length < 3) return;

        abortControllerRef.current?.abort();

        setInternalLoading(true);

        const controller = new AbortController();
        abortControllerRef.current = controller;

        googlePlacesStore.searchPlaces(query, controller.signal)
            .then(results => setSearchResults(results))
            .catch(error => {
                console.error(error);
                notifications.show("Ortsdaten konnten nicht abgefragt werden.", {severity: 'error', autoHideDuration: 3000,});
            })
            .finally(() => setInternalLoading(false));
    };

    const handleAddressSelection = async (place: PlaceSearchResult | null) => {
        if (!place) return;

        abortControllerRef.current?.abort();

        try {
            const placeDetails = await googlePlacesStore.getPlaceDetails(place.placeId);
            if (!placeDetails) return;

            const newAddress: Address = {
                latitude: placeDetails.location.latitude,
                longitude: placeDetails.location.longitude,
                street: '',
                houseNumber: '',
                city: '',
                zip: 0,
                note: '',
            };

            placeDetails.addressComponents?.forEach((component) => {
                if (!component.types || !component.longText) return;
                if (component.types.includes('street_number')) {
                    newAddress.houseNumber = component.longText;
                } else if (component.types.includes('route')) {
                    newAddress.street = component.longText;
                } else if (component.types.includes('locality')) {
                    newAddress.city = component.longText;
                } else if (component.types.includes('postal_code')) {
                    const zip = parseInt(component.longText, 10);
                    if (!isNaN(zip)) {
                        newAddress.zip = zip;
                    }
                }
            });

            setAddressState(newAddress);
            setStreetTouched(true);
            setHouseNumberTouched(true);
            setZipTouched(true);
            setCityTouched(true);

            onChange?.(newAddress);
        } catch (error) {
            console.error('Address fetch error:', error);
        }
    };

    const handleFieldChange = <K extends keyof Address>(field: K, value: Address[K]) => {
        const updatedAddress = { ...addressState, [field]: value };
        setAddressState(updatedAddress);

        switch (field) {
            case 'street':
                setStreetTouched(true);
                break;
            case 'houseNumber':
                setHouseNumberTouched(true);
                break;
            case 'zip':
                setZipTouched(true);
                break;
            case 'city':
                setCityTouched(true);
                break;
            default:
                break;
        }

        onChange?.(updatedAddress);
    };

    if (loading) {
        return (
            <form>
                <Typography variant="subtitle1" gutterBottom>
                    Addresse
                </Typography>
                <Skeleton variant="rounded" height={56} />
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={6}>
                        <Skeleton variant="rounded" height={56} />
                    </Grid>
                    <Grid size={6}>
                        <Skeleton variant="rounded" height={56} />
                    </Grid>
                    <Grid size={6}>
                        <Skeleton variant="rounded" height={56} />
                    </Grid>
                    <Grid size={6}>
                        <Skeleton variant="rounded" height={56} />
                    </Grid>
                    <Grid size={12}>
                        <Skeleton variant="rounded" height={84} />
                    </Grid>
                </Grid>
            </form>
        );
    }

    return (
        <form>
            <Typography variant="subtitle1" gutterBottom>
                Addresse
            </Typography>

            <Autocomplete
                freeSolo
                loading={internalLoading}
                options={searchResults}
                getOptionLabel={(option) =>
                    typeof option === 'string'
                        ? option
                        : option.formattedAddress || 'Ungültiger Wert'
                }
                onInputChange={(_, newValue) => handleSearchPlaces(newValue)}
                onChange={(_, newValue) => {
                    if (typeof newValue !== 'string') {
                        handleAddressSelection(newValue);
                    }
                }}
                renderOption={(props, option) => (
                    <li {...props} key={option.placeId}>
                        {option.formattedAddress}
                    </li>
                )}
                renderInput={(params) => (
                    <TextField {...params} label="Addresse suchen..." />
                )}
            />

            <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={6}>
                    <TextField
                        fullWidth
                        label="Straße"
                        value={addressState.street}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            handleFieldChange('street', e.target.value)
                        }
                        error={!!validateStreet(addressState.street)}
                        helperText={validateStreet(addressState.street)}
                        required
                    />
                </Grid>
                <Grid size={6}>
                    <TextField
                        fullWidth
                        label="Hausnummer"
                        value={addressState.houseNumber}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            handleFieldChange('houseNumber', e.target.value)
                        }
                        error={!!validateHouseNumber(addressState.houseNumber)}
                        helperText={validateHouseNumber(addressState.houseNumber)}
                        required
                    />
                </Grid>
                <Grid size={6}>
                    <TextField
                        fullWidth
                        label="PLZ"
                        type="number"
                        value={addressState.zip}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            handleFieldChange('zip', Number(e.target.value))
                        }
                        error={!!validateZip(addressState.zip)}
                        helperText={validateZip(addressState.zip)}
                        required
                    />
                </Grid>
                <Grid size={6}>
                    <TextField
                        fullWidth
                        label="Stadt"
                        value={addressState.city}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            handleFieldChange('city', e.target.value)
                        }
                        error={!!validateCity(addressState.city)}
                        helperText={validateCity(addressState.city)}
                        required
                    />
                </Grid>
                <Grid size={12}>
                    <TextField
                        fullWidth
                        label="Anmerkung"
                        multiline
                        rows={2}
                        value={addressState.note}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            handleFieldChange('note', e.target.value)
                        }
                    />
                </Grid>
            </Grid>
        </form>
    );
};

export default AddressAutocomplete;
