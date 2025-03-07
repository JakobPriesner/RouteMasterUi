import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    MenuItem,
    Select,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TextField,
    Typography,
    Paper,
    FormControl,
    InputAdornment,
} from "@mui/material";
import { Vehicle, VehicleType, VehicleTypeLabels } from "../../types/VehiclesTypes";
import { CompareOperator } from "../../types/OperatorTypes";
import { useParams, useNavigate } from "react-router";
import { VehiclesStore } from "../../stores/VehiclesStore";
import CreateVehicleDialog from "../../dialogs/createVehicle";
import CreateEntryButton from "../buttons/createEntryButton";
import VehicleTypeSelect from "./vehicleTypeSelect";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import LinearProgress from "@mui/material/LinearProgress";
import ShortAddressTextField from "../address/shortAddressTextField";
import CustomTablePagination from "../tables/customTablePagination";
import CustomTableHeader from "../tables/tableHeader";

interface VehiclesTable {
    onUpdate: (selectedVehicles: Vehicle[]) => void;
    selectable?: boolean;
    showVehicleTypeFilter?: boolean;
    initialVehicleTypes?: VehicleType[];
    showAvailableLoadFilter?: boolean;
    initialAvailableLoadInKilograms?: number;
    initialAvailableLoadOperator?: CompareOperator;
    showNoVehiclesWarning?: boolean;
}

const VehiclesTable: React.FC<VehiclesTable> = ({
                                                    onUpdate = () => {},  // Provide default empty function to prevent "not a function" errors
                                                    selectable = true,
                                                    showVehicleTypeFilter = true,
                                                    initialVehicleTypes = [],
                                                    showAvailableLoadFilter = true,
                                                    initialAvailableLoadInKilograms,
                                                    initialAvailableLoadOperator = CompareOperator.gt,
                                                    showNoVehiclesWarning = true
                                                }) => {
    const { projectId } = useParams();
    const navigate = useNavigate();

    const [selectedVehicles, setSelectedVehicles] = useState<Vehicle[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[] | undefined>();
    const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<VehicleType[]>(initialVehicleTypes ?? []);
    const [availableLoad, setAvailableLoad] = useState<number | null>(initialAvailableLoadInKilograms ?? null);
    const [loadOperator, setLoadOperator] = useState<CompareOperator>(initialAvailableLoadOperator);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [searchString, setSearchString] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!projectId) {
            return;
        }

        setIsLoading(true);
        VehiclesStore.getAllVehiclesOfProject(projectId)
            .subscribe({
                next: vehicles => {
                    setVehicles(vehicles);
                    setIsLoading(false);
                },
                error: () => setIsLoading(false)
            });
    }, [projectId]);

    // Update this effect to include onUpdate in the dependency array
    // and to handle potential errors with try/catch
    useEffect(() => {
        try {
            // Only call onUpdate if it's actually a function
            if (typeof onUpdate === 'function') {
                onUpdate(selectedVehicles);
            }
        } catch (error) {
            console.error("Error calling onUpdate:", error);
        }
    }, [selectedVehicles, onUpdate]); // Include onUpdate in dependencies

    const filteredVehicles = useMemo(() => {
        if (!vehicles) {
            return [];
        }

        const lowerSearchString = searchString?.trim().toLowerCase() ?? "";

        return vehicles.filter(vehicle =>
            (selectedVehicleTypes.length === 0 || selectedVehicleTypes.includes(vehicle.vehicleType))
            && (!availableLoad || compareAvailableLoad(vehicle.availableLoadInKilograms, availableLoad, loadOperator))
            && (lowerSearchString.length === 0 ||
                vehicle.alias.toLowerCase().includes(lowerSearchString) ||
                vehicle.licencePlate.toLowerCase().includes(lowerSearchString))
        );
    }, [vehicles, selectedVehicleTypes, availableLoad, loadOperator, searchString]);

    const paginatedVehicles = useMemo(() => {
        const from = page * pageSize;
        const to = from + pageSize;
        return filteredVehicles.slice(from, to);
    }, [filteredVehicles, page, pageSize]);

    function compareAvailableLoad(availableLoad: number, referenceValue: number, operator: CompareOperator) {
        if (operator === CompareOperator.gt) {
            return availableLoad > referenceValue;
        }
        if (operator === CompareOperator.lt) {
            return availableLoad < referenceValue;
        }
        if (operator === CompareOperator.eq) {
            return availableLoad === referenceValue;
        }
        return false;
    }

    const onVehicleSelect = (vehicle: Vehicle) => {
        if (!selectable) {
            return;
        }

        const newSelection = [...selectedVehicles];
        if (newSelection.some(v => v.id === vehicle.id)) {
            const index = newSelection.findIndex(v => v.id === vehicle.id);
            newSelection.splice(index, 1);
        } else {
            newSelection.push(vehicle);
        }

        setSelectedVehicles(newSelection);
        // onUpdate is now called in the useEffect, not here
    };

    const handleSelectAll = (checked: boolean) => {
        let newSelection;
        if (checked) {
            newSelection = [...selectedVehicles];
            paginatedVehicles.forEach(vehicle => {
                if (!newSelection.some(v => v.id === vehicle.id)) {
                    newSelection.push(vehicle);
                }
            });
        } else {
            newSelection = selectedVehicles.filter(
                selected => !paginatedVehicles.some(v => v.id === selected.id)
            );
        }

        setSelectedVehicles(newSelection);
        // onUpdate is now called in the useEffect, not here
    };

    if (isLoading) {
        return <LinearProgress />;
    }

    return (
        <Paper elevation={0} sx={{ bgcolor: 'transparent' }}>
            <CreateVehicleDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(!createDialogOpen)} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <CreateEntryButton
                    onClick={() => setCreateDialogOpen(true)}
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

                <TextField
                    placeholder="Suche nach Name oder Kennzeichen"
                    variant="outlined"
                    value={searchString || ''}
                    onChange={(e) => setSearchString(e.target.value)}
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" color="action" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ minWidth: 240 }}
                />

                {showVehicleTypeFilter && (
                    <Box sx={{ minWidth: 140 }}>
                        <VehicleTypeSelect
                            onChange={setSelectedVehicleTypes}
                            multiSelect={true}
                            value={selectedVehicleTypes}
                        />
                    </Box>
                )}

                {showAvailableLoadFilter && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FormControl variant="outlined" size="small" sx={{ width: 80 }}>
                            <Select
                                displayEmpty
                                value={loadOperator}
                                onChange={(event) => setLoadOperator(event.target.value as CompareOperator)}
                                sx={{ minWidth: 60 }}
                            >
                                <MenuItem value={CompareOperator.lt}>&lt;</MenuItem>
                                <MenuItem value={CompareOperator.eq}>=</MenuItem>
                                <MenuItem value={CompareOperator.gt}>&gt;</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            placeholder="Nutzlast (kg)"
                            type="number"
                            value={availableLoad || ''}
                            onChange={(e) => setAvailableLoad(Number(e.target.value) || 0)}
                            size="small"
                            sx={{ width: 160 }}
                        />
                    </Box>
                )}
            </Paper>

            <Paper variant="outlined" sx={{ borderRadius: 1, overflow: 'hidden' }}>
                {filteredVehicles.length === 0 && showNoVehiclesWarning ? (
                    <Alert severity="warning"
                           action={<Button variant="text" color="warning" onClick={() => navigate(`/projects/${projectId}/vehicles`)}>Fahrzeug erstellen</Button>}
                    >
                        Es gibt kein Fahrzeug mit diesen Filtern.
                    </Alert>
                ) : (
                    <>
                        <TableContainer>
                            <Table size="small">
                                <CustomTableHeader allSelected={paginatedVehicles.length > 0 && paginatedVehicles.every(
                                    v => selectedVehicles.some(s => s.id === v.id)
                                )}
                                                   anySelected={paginatedVehicles.some(v => selectedVehicles.some(s => s.id === v.id)) &&
                                                       !paginatedVehicles.every(v => selectedVehicles.some(s => s.id === v.id))}
                                                   columns={["Name", "Nummernschild", "Parkposition", "Fahrzeugtyp"]}
                                                   onSelected={(selected: boolean) => handleSelectAll(selected)}
                                />
                                <TableBody>
                                    {isLoading ? (
                                        Array.from(new Array(10)).map((_, index) => (
                                            <TableRow key={index}>
                                                {selectable && (
                                                    <TableCell padding="checkbox">
                                                        <Skeleton variant="circular" width={24} height={24}/>
                                                    </TableCell>
                                                )}
                                                <TableCell>
                                                    <Skeleton variant="text" sx={{fontSize: '1rem'}} width={100}/>
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton variant="text" sx={{fontSize: '1rem'}} width={100}/>
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton variant="text" sx={{fontSize: '1rem'}} width={150}/>
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton variant="text" sx={{fontSize: '1rem'}} width={80}/>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        paginatedVehicles.map((vehicle: Vehicle) => (
                                            <TableRow key={vehicle.id} onClick={() => onVehicleSelect(vehicle)}>
                                                {selectable && (
                                                    <TableCell padding="checkbox">
                                                        <Checkbox
                                                            checked={selectedVehicles.some(v => v.id === vehicle.id)}
                                                            onChange={() => onVehicleSelect(vehicle)}
                                                        />
                                                    </TableCell>
                                                )}
                                                <TableCell>{vehicle.alias}</TableCell>
                                                <TableCell>{vehicle.licencePlate}</TableCell>
                                                <TableCell>
                                                    <ShortAddressTextField address={vehicle.parkingPosition} size="small"/>
                                                </TableCell>
                                                <TableCell>
                                                    {VehicleTypeLabels[vehicle.vehicleType]}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <CustomTablePagination
                            totalCount={filteredVehicles.length}
                            onPageChange={(newPage: number) => setPage(newPage)}
                            onPageSizeChange={(newPageSize: number) => setPageSize(newPageSize)}
                            itemName="Fahrzeuge"
                            selectedCount={selectedVehicles.length}
                        />
                    </>
                )}
            </Paper>
        </Paper>
    );
};

export default VehiclesTable;
