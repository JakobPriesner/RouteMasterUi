import {alpha, Box, Checkbox, TableCell, TableHead, TableRow, Typography, useTheme} from "@mui/material";
import React, {ReactNode} from "react";


export interface TableHeaderProps {
    children?: ReactNode;
    selectable: boolean;
    allSelected: boolean;
    anySelected: boolean;
    columns: string[];
    onSelected?: (selected: boolean) => void;
}

const CustomTableHeader: React.FC<TableHeaderProps> = ({
                                                            children,
                                                            selectable=false,
                                                            allSelected=false,
                                                            anySelected=false,
                                                            columns,
                                                            onSelected
                                                        }) => {
    const theme = useTheme();

    return (
        <TableHead>
            <TableRow sx={{
                backgroundColor: theme.palette.mode === 'light'
                    ? alpha(theme.palette.common.black, 0.03)
                    : alpha(theme.palette.common.white, 0.05),
                '& .MuiTableCell-root': {
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    py: 1.5
                }
            }}>
                {selectable && (
                    <TableCell padding="checkbox">
                        <Checkbox
                            checked={allSelected}
                            indeterminate={anySelected}
                            onChange={(e) => onSelected(e.target.checked)}
                        />
                    </TableCell>
                )}
                {
                    columns.map(column => (
                        <TableCell>{column}</TableCell>
                    ))
                }
            </TableRow>
        </TableHead>
    );
};

export default CustomTableHeader;
