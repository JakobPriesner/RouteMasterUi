import React, { useState, useMemo } from "react";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TextField,
    Typography,
    InputAdornment,
    CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import Grid from "@mui/material/Grid2";
import { useNavigate, useParams } from "react-router-dom";
import CustomTablePagination from "../tables/customTablePagination";
import CustomTableHeader from "../tables/tableHeader";
import CreateEntryButton from "../buttons/createEntryButton";
import {Contact} from "../../types/ContactsTypes";

export interface Column {
    id: string;
    label: string;
    minWidth?: number;
    align?: "right" | "left" | "center";
}

interface ContactsTableProps {
    contacts: any[];
    columns: Column[];
    totalCount: number;
    loading: boolean;
    searchString: string;
    onSearchChange: (search: string) => void;
    onRowClick?: (contact: any) => void;
    onAddContact?: () => void;
    selectable?: boolean;
    selectedContacts?: any[];
    onSelectedContactsChange?: (contacts: any[]) => void;
    showNoContactsWarning?: boolean;
    warningMessage?: string;
    showFilter?: boolean;
    clickable?: boolean;
}

const ContactsTable: React.FC<ContactsTableProps> = ({
                                                         contacts,
                                                         columns,
                                                         totalCount,
                                                         loading,
                                                         searchString,
                                                         onSearchChange,
                                                         onRowClick,
                                                         onAddContact,
                                                         selectable = false,
                                                         selectedContacts = [],
                                                         onSelectedContactsChange,
                                                         showNoContactsWarning = true,
                                                         warningMessage = "Keine Kontakte gefunden.",
                                                         showFilter = false,
                                                         clickable = true,
                                                     }) => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const paginatedContacts = useMemo(() => {
        const from = page * pageSize;
        const to = from + pageSize;
        return contacts.slice(from, to);
    }, [contacts, page, pageSize]);

    const handleSelectContact = (contact: any) => {
        if (!selectable || !onSelectedContactsChange) return;

        const newSelection = [...selectedContacts];
        if (newSelection.some(c => c.id === contact.id)) {
            const index = newSelection.findIndex(c => c.id === contact.id);
            newSelection.splice(index, 1);
        } else {
            newSelection.push(contact);
        }

        onSelectedContactsChange(newSelection);
    };

    const handleSelectAll = (checked: boolean) => {
        if (!selectable || !onSelectedContactsChange) return;

        let newSelection;
        if (checked) {
            newSelection = [...selectedContacts];
            paginatedContacts.forEach(contact => {
                if (!newSelection.some(c => c.id === contact.id)) {
                    newSelection.push(contact);
                }
            });
        } else {
            newSelection = selectedContacts.filter(
                selected => !paginatedContacts.some(c => c.id === selected.id)
            );
        }

        onSelectedContactsChange(newSelection);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setPage(0); // Reset to first page when changing page size
    };

    return (
        <Paper elevation={0} sx={{ bgcolor: 'transparent' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                {onAddContact && (
                    <CreateEntryButton
                        onClick={onAddContact}
                        startIcon="+"
                        variant="contained"
                        color="primary"
                        sx={{
                            borderRadius: 1,
                            textTransform: 'uppercase',
                            fontWeight: 500,
                            boxShadow: 2,
                            px: 3
                        }}
                    >
                        Hinzufügen
                    </CreateEntryButton>
                )}
            </Box>

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
                        Filter & Suche
                    </Typography>
                </Box>

                <Grid container spacing={2} sx={{ alignItems: "center" }}>
                    <Grid size={{xs: 12, sm: 12}}>
                        <TextField
                            fullWidth
                            placeholder="Suchen..."
                            value={searchString}
                            disabled={loading}
                            size="small"
                            onChange={(e) => onSearchChange(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        {loading ? <CircularProgress color="inherit" size="1rem"/> : <SearchIcon />}
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                </Grid>
            </Paper>

            <Paper variant="outlined" sx={{ borderRadius: 1, overflow: 'hidden' }}>
                {contacts.length === 0 && !loading && showNoContactsWarning ? (
                    <Alert severity="warning"
                           action={onAddContact && <Button variant="text" color="warning" onClick={onAddContact}>Kontakt erstellen</Button>}
                    >
                        {warningMessage}
                    </Alert>
                ) : (
                    <>
                        <TableContainer sx={{ maxHeight: '70vh' }}>
                            <Table stickyHeader aria-label="contacts table">
                                <CustomTableHeader
                                    allSelected={paginatedContacts.length > 0 && paginatedContacts.every(
                                        c => selectedContacts.some(s => s.id === c.id)
                                    )}
                                    anySelected={paginatedContacts.some(c => selectedContacts.some(s => s.id === c.id)) &&
                                        !paginatedContacts.every(c => selectedContacts.some(s => s.id === c.id))}
                                    columns={columns.map((col: Column) => col.label)}
                                    onSelected={(selected: boolean) => handleSelectAll(selected)}
                                    showCheckbox={selectable}
                                />
                                <TableBody>
                                    {loading ? (
                                        Array.from({ length: pageSize }, (_, index) => (
                                            <TableRow key={index}>
                                                {selectable && (
                                                    <TableCell padding="checkbox">
                                                        <Skeleton variant="circular" width={24} height={24}/>
                                                    </TableCell>
                                                )}
                                                {columns.map((column: Column) => (
                                                    <TableCell key={column.id} align={column.align}>
                                                        <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        paginatedContacts.map((contact: Contact) => (
                                            <TableRow
                                                hover
                                                role="checkbox"
                                                tabIndex={-1}
                                                key={contact.id}
                                                sx={{ cursor: clickable || selectable ? "pointer" : "default" }}
                                                onClick={() => {
                                                    if (clickable && onRowClick) {
                                                        onRowClick(contact);
                                                    }
                                                }}
                                            >
                                                {selectable && (
                                                    <TableCell padding="checkbox">
                                                        <Checkbox
                                                            checked={selectedContacts.some(c => c.id === contact.id)}
                                                            onChange={() => handleSelectContact(contact)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </TableCell>
                                                )}
                                                {columns.map((column: Column) => {
                                                    const value = contact[column.id];
                                                    let valueAsString = "";

                                                    if (!value) {
                                                        valueAsString = "";
                                                    } else if (typeof value === "string") {
                                                        valueAsString = value;
                                                    } else if (typeof value === "object") {
                                                        valueAsString = `${value.street || ""} ${value.houseNumber || ""}, ${value.zip || ""} ${value.city || ""}`;
                                                    }

                                                    return (
                                                        <TableCell key={column.id} align={column.align}>
                                                            {valueAsString}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <CustomTablePagination
                            itemName="Kontakte"
                            totalCount={totalCount}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                            selectedCount={selectable ? selectedContacts.length : undefined}
                        />
                    </>
                )}
            </Paper>
        </Paper>
    );
};

export default ContactsTable;
