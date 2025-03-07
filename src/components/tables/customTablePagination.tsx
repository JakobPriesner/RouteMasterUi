import React, { useState } from "react";
import {alpha, Box, Button, Chip, Select, Typography, useTheme} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import {ArrowLeftRounded, ArrowRightRounded} from "@mui/icons-material";


export interface TablePaginationProps {
    totalCount: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    itemName?: string;
    selectedCount?: number;
}

const CustomTablePagination: React.FC<TablePaginationProps> = ({
                                                            totalCount,
                                                            onPageChange,
                                                            onPageSizeChange,
                                                            itemName = 'Einträge',
                                                            selectedCount
                                                        }) => {
    const theme = useTheme();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    function internalOnPageChange (page: number) {
        setPage(page);
        onPageChange(page);
    }

    function internalOnPageSizeChange (pageSize: number) {
        setPageSize(pageSize);
        onPageSizeChange(pageSize);
    }

    function renderText () {
        if (selectedCount && selectedCount > 0) {
            return (
                <Chip label={`${selectedCount} ${itemName} ausgewählt`} color="primary" />
            );
        }

        return (
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                {totalCount} {itemName} gefunden
            </Typography>
        );
    }

    return (
        <Box
            sx={{
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.mode === 'light'
                    ? alpha(theme.palette.common.black, 0.03)
                    : alpha(theme.palette.common.white, 0.05)
            }}
        >
            {renderText()}
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ mr: 2 }} color="textSecondary">
                    {itemName} pro Seite:
                </Typography>
                <Select
                    value={pageSize}
                    onChange={(event) => internalOnPageSizeChange(event.target.value as number)}
                    size="small"
                    sx={{
                        minWidth: 80,
                        mr: 2,
                        '& .MuiSelect-select': { py: 0.5 }
                    }}
                >
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                </Select>

                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    {`${(page - 1) * pageSize + 1}-${Math.min((page + 1) * pageSize, totalCount)} von ${totalCount}`}
                </Typography>

                <Box sx={{ display: 'flex', ml: 2 }}>
                    <Button
                        size="small"
                        disabled={page <= 1}
                        onClick={() => internalOnPageChange(page + 1)}
                        sx={{ minWidth: 'auto', p: 0.5 }}
                    >
                        <ArrowLeftRounded />
                    </Button>
                    <Button
                        size="small"
                        disabled={(page + 1) * pageSize >= totalCount}
                        onClick={() => internalOnPageChange(page - 1)}
                        sx={{ minWidth: 'auto', p: 0.5 }}
                    >
                        <ArrowRightRounded />
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default CustomTablePagination;
