import React, { useState } from 'react';
import TextField, { TextFieldVariants } from '@mui/material/TextField';

interface LicencePlateProps {
    value?: string;
    variant?: TextFieldVariants;
    label?: string;
    required?: boolean;
    fullWidth?: boolean;
    onChange: (value: string) => void;
}

const LicensePlateInput: React.FC<LicencePlateProps> = ({
                                                            value = "",
                                                            variant = "outlined",
                                                            label = "Kennzeichen",
                                                            required = true,
                                                            fullWidth = true,
                                                            onChange,
                                                        }) => {
    const [plate, setPlate] = useState<string>(value);

    const formatPlate = (input: string): string => {
        const hasTrailingSpace = input.endsWith(' ');
        const cleaned = input.replace(/\s+/g, '').toUpperCase();
        if (cleaned.length === 0) return '';

        let i = 0;
        while (i < cleaned.length && /[A-Z]/.test(cleaned[i])) {
            i++;
        }
        const regionLength = Math.min(i, 3);
        const region = cleaned.substring(0, regionLength);
        const remainder = cleaned.substring(regionLength);

        let formatted = region;
        if (remainder.length > 0 || hasTrailingSpace) {
            formatted += ' ';

            let j = 0;
            while (j < remainder.length && /[A-Z]/.test(remainder[j])) {
                j++;
            }
            const series = remainder.substring(0, j);
            const numbers = remainder.substring(j);

            if (series.length > 0) {
                formatted += series;
                if (numbers.length > 0) {
                    formatted += ' ' + numbers;
                } else if (hasTrailingSpace) {
                    formatted += ' ';
                }
            } else {
                formatted += numbers;
            }
        }

        return formatted;
    };

    const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        const formattedPlate = formatPlate(input);
        setPlate(formattedPlate);
        onChange(formattedPlate);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === ' ') {
            if (plate.endsWith(' ')) {
                e.preventDefault();
            }
        }
    };

    return (
        <TextField
            fullWidth={fullWidth}
            required={required}
            label={label}
            variant={variant}
            value={plate}
            onChange={handlePlateChange}
            onKeyDown={handleKeyDown}
        />
    );
};

export default LicensePlateInput;
