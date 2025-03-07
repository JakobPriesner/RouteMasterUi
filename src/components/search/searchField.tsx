import React from "react";
import {InputAdornment, TextField} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

export interface SearchFieldProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const SearchField: React.FC<SearchFieldProps> = ({
                                                            value,
                                                            onChange,
                                                            placeholder = 'Suche...'
                                                        }) => {
    return (
        <TextField
            placeholder={placeholder}
            variant="outlined"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            size="small"
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchRoundedIcon fontSize="small" color="action" />
                    </InputAdornment>
                ),
            }}
            sx={{ minWidth: { xs: '100%', sm: 240 } }}
        />
    );
};
