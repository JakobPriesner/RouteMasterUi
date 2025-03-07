import {useNavigate, useParams} from "react-router-dom";
import {useNotifications} from "@toolpad/core/useNotifications";
import React, { useEffect, useState, useMemo } from 'react';

import {Route, RouteState, RouteStateLabels} from '../../types/RoutesTypes';
import {RoutesStore} from "../../stores/RoutesStore";
import {format} from "date-fns";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import CreateEntryButton from "../../components/buttons/createEntryButton";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid2";
import {Alert, Button, LinearProgress, Paper, Skeleton, TableCell, TableContainer, Typography, useTheme } from "@mui/material";
import CreateRouteDialog from "../../dialogs/createRoute";
import CustomTableHeader from "../../components/tables/tableHeader";
import CustomTablePagination from "../../components/tables/customTablePagination";

const columns = [
    { id: 'startTime', label: 'Datum', minWidth: 120 },
    { id: 'state', label: 'Zustand', minWidth: 120 },
    { id: 'jobsCount', label: 'Anzahl Jobs', minWidth: 120 },
    { id: 'totalCostInEuros', label: 'Kosten (€)', minWidth: 100 },
    { id: 'actions', label: 'Aktionen', minWidth: 150 },
];

export default function RoutesManagementPage() {
    const navigate = useNavigate();
    const notifications = useNotifications();
    const { projectId } = useParams<{ projectId: string }>();
    const theme = useTheme();

    const [fromDate, setFromDate] = useState<Date | null>(new Date(Date.now()));
    const [toDate, setToDate] = useState<Date | null>(null);
    const [routeStates, setRouteStates] = useState<RouteState[]>([]);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
    const [newlyCreatedRouteId, setNewlyCreatedRouteId] = useState<string | null>(null);

    if (!projectId) {
        navigate("/projects");
    }

    useEffect(() => {
        setIsLoading(true);
        const routesSubject = RoutesStore.getAllRoutes(projectId, fromDate, toDate, routeStates).subscribe({
            next: routes => {
                setRoutes(routes.routes);
                setIsLoading(false);
            },
            error: () => {
                setIsLoading(false);
                notifications.show("Es gab ein Problem beim Laden der Routen.", { severity: "error", autoHideDuration: 3000 });
            }
        });

        return () => {
            routesSubject.unsubscribe();
        }
    }, [projectId, fromDate, toDate, routeStates, notifications, refreshTrigger]);

    const groupedRoutes = useMemo(() => {
        const grouping: Record<string, Route[]> = {};

        routes.forEach((route) => {
            const dateStr = route.startTime
                ? route.startTime.toLocaleDateString()
                : 'Kein Datum';

            if (!grouping[dateStr]) {
                grouping[dateStr] = [];
            }
            grouping[dateStr].push(route);
        });
        return grouping;
    }, [routes]);

    const dateKeys = Object.keys(groupedRoutes).sort();

    const flattenedRoutes: Array<{ dateStr: string; route: Route }> = [];
    for (const key of dateKeys) {
        groupedRoutes[key].forEach((r) => {
            flattenedRoutes.push({ dateStr: key, route: r });
        });
    }

    const totalCount = flattenedRoutes.length;

    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    const currentPageData = flattenedRoutes.slice(startIndex, endIndex);

    const handleDeleteRoute = async (routeId: string) => {
        await RoutesStore.deleteRoute(projectId, routeId);
        // Trigger refresh after delete
        setRefreshTrigger(prev => prev + 1);
    };

    const handleOpenCreateDialog = () => {
        setOpenCreateDialog(true);
    };

    const handleCloseCreateDialog = () => {
        setOpenCreateDialog(false);
    };

    const handleRouteCreated = (routeId: string) => {
        // Highlight the newly created route
        setNewlyCreatedRouteId(routeId);

        // Clear the highlighting after 5 seconds
        setTimeout(() => {
            setNewlyCreatedRouteId(null);
        }, 5000);

        // Refresh the routes data
        setRefreshTrigger(prev => prev + 1);

        // Show success notification
        notifications.show("Route wurde erfolgreich erstellt!", { severity: "success", autoHideDuration: 3000 });

        // Reset to first page to show the new route
        setPage(0);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setPage(0);
    };

    return (
        <Paper elevation={0} sx={{ bgcolor: 'transparent' }}>
            {isLoading && <LinearProgress sx={{ height: 3 }} />}

            {/* Create Entry Button - Top Row */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <CreateEntryButton
                    onClick={handleOpenCreateDialog}
                    variant="contained"
                    color="primary"
                    sx={{
                        borderRadius: 1,
                        textTransform: 'uppercase',
                        fontWeight: 500,
                        boxShadow: 2,
                        px: 3
                    }}
                />
            </Box>

            {/* Filter Section */}
            <Paper
                elevation={0}
                variant="outlined"
                sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 1
                }}
            >
                <Grid container spacing={2}>
                    <Grid size={{xs: 12, sm: 6, md: 3}}>
                        <FormControl fullWidth>
                            <DatePicker
                                label="Von"
                                value={fromDate}
                                onChange={(newDate) => setFromDate(newDate)}
                                format={"dd.MM.yyyy"}
                                slotProps={{textField: {size: 'small', fullWidth: true}}}
                            />
                        </FormControl>
                    </Grid>
                    <Grid size={{xs: 12, sm: 6, md: 3}}>
                        <FormControl fullWidth>
                            <DatePicker
                                label="Bis"
                                value={toDate}
                                onChange={(newDate) => setToDate(newDate)}
                                format={"dd.MM.yyyy"}
                                slotProps={{textField: {size: 'small', fullWidth: true}}}
                            />
                        </FormControl>
                    </Grid>
                    <Grid size={{xs: 12, md: 6}}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="zustand-label">Zustand</InputLabel>
                            <Select
                                fullWidth
                                multiple
                                labelId="zustand-label"
                                label="Zustand"
                                value={routeStates}
                                onChange={(e) => {
                                    const {
                                        target: {value},
                                    } = e;
                                    setRouteStates(typeof value === 'string' ? value.split(',').map(v => v as RouteState) : value);
                                }}
                            >
                                <MenuItem value="Planned">Geplant</MenuItem>
                                <MenuItem value="Started">Gestartet</MenuItem>
                                <MenuItem value="InProgress">in Arbeit</MenuItem>
                                <MenuItem value="Completed">Abgeschlossen</MenuItem>
                                <MenuItem value="Cancelled">Abgebrochen</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {newlyCreatedRouteId && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Eine neue Route wurde erstellt und wird in der Tabelle angezeigt.
                </Alert>
            )}

            <Paper variant="outlined" sx={{ borderRadius: 1, overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: '70vh' }}>
                    <Table stickyHeader size="small">
                        <CustomTableHeader
                            columns={columns.map(col => col.label)}
                            showCheckbox={false}
                            sx={{
                                backgroundColor: theme => theme.palette.mode === 'light'
                                    ? '#f5f5f5'
                                    : theme.palette.background.default
                            }}
                        />
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: pageSize }, (_, index) => (
                                    <TableRow key={index}>
                                        {columns.map((col) => (
                                            <TableCell key={col.id}>
                                                <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                currentPageData.map(({ dateStr, route }, idx) => {
                                    const isFirstOfDate =
                                        idx === 0 ||
                                        dateStr !== currentPageData[idx - 1]?.dateStr;

                                    const isNewlyCreated = route.id === newlyCreatedRouteId;

                                    return (
                                        <React.Fragment key={route.id}>
                                            {isFirstOfDate && (
                                                <TableRow hover tabIndex={-1}>
                                                    <TableCell colSpan={columns.length}>
                                                        <Typography variant="subtitle1" fontWeight="bold">
                                                            Datum: {dateStr}
                                                        </Typography>
                                                        <Divider />
                                                    </TableCell>
                                                </TableRow>
                                            )}

                                            <TableRow
                                                hover
                                                tabIndex={-1}
                                                sx={isNewlyCreated ? {
                                                    backgroundColor: theme.palette.success.light,
                                                    transition: 'background-color 0.5s'
                                                } : {}}
                                            >
                                                <TableCell>
                                                    {route.startTime
                                                        ? format(new Date(route.startTime), "dd.MM.yyyy")
                                                        : '—'}
                                                </TableCell>
                                                <TableCell>{RouteStateLabels[route.state] ?? "unbekannt"}</TableCell>
                                                <TableCell>{route.jobs.length}</TableCell>
                                                <TableCell>{route.totalCostInEuros} €</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        size="small"
                                                        onClick={() => handleDeleteRoute(route.id)}
                                                    >
                                                        Löschen
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <CustomTablePagination
                    totalCount={totalCount}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    itemName="Routen"
                />
            </Paper>

            <CreateRouteDialog
                open={openCreateDialog}
                onClose={handleCloseCreateDialog}
                initialSelectedJobs={[]}
                onRouteCreated={handleRouteCreated}
            />
        </Paper>
    );
}
