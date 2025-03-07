import {Box, Paper, Typography} from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import React, {ReactNode} from "react";


export interface FilterSectionProps {
    children: ReactNode;
    title?: string;
}

export const FilterSection: React.FC<FilterSectionProps> = ({ children, title = 'Filter & Suche' }) => {

    return (
        <Paper
            elevation={0}
            variant="outlined"
            sx={{
                mb: 2,
                p: 2,
                borderRadius: 1,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                alignItems: 'center'
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                <FilterAltIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1.2rem' }} />
                <Typography variant="subtitle2" color="text.primary">
                    {title}
                </Typography>
            </Box>
            <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                alignItems: 'center',
                width: { xs: '100%', sm: 'auto' }
            }}>
                {children}
            </Box>
        </Paper>
    );
};
