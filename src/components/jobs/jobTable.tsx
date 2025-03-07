import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    alpha,
    Box,
    Button,
    Checkbox,
    Chip,
    FormControl,
    InputLabel,
    LinearProgress,
    MenuItem,
    Paper,
    Select,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Typography,
    useTheme
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { useNavigate } from "react-router-dom";
import { Navigate, useParams } from "react-router";
import { GetAllJobsResult, Job, JobState, JobStateLabels } from "../../types/JobTypes";
import { Contact } from "../../types/ContactsTypes";
import { JobsStore } from "../../stores/JobsStore";
import { ContactsStore } from "../../stores/ContactsStore";
import { useNotifications } from "@toolpad/core/useNotifications";
import { format } from 'date-fns';
import ShortAddressTextField from "../address/shortAddressTextField";
import TimeWindows from "../time-windows/timeWindows";
import { Subscription } from "rxjs";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import {ArrowLeftRounded, ArrowRightRounded} from "@mui/icons-material";
import CustomTableHeader from "../tables/tableHeader";
import CustomTablePagination from "../tables/customTablePagination";

interface JobsTableProps {
    onUpdate: (selectedJobs: string[]) => void;
    showDateFilter?: boolean;
    showStateFilter?: boolean;
    initialFromDate?: Date;
    initialToDate?: Date;
    initialStateFilter?: JobState[];
    selectable?: boolean;
    showNoJobsWarning?: boolean;
    initialGrouped?: boolean;
}

const JobsTable: React.FC<JobsTableProps> = ({
                                                 onUpdate,
                                                 showDateFilter = true,
                                                 showStateFilter = true,
                                                 initialFromDate = new Date(Date.now()),
                                                 initialToDate,
                                                 initialStateFilter,
                                                 selectable = true,
                                                 showNoJobsWarning = true,
                                                 initialGrouped = true
                                             }) => {
    const theme = useTheme();
    const { projectId } = useParams();
    const [fromDate, setFromDate] = useState<Date | null>(initialFromDate ?? new Date(Date.now()));
    const [toDate, setToDate] = useState<Date | undefined | null>(initialToDate);
    const [jobStateFilter, setJobStateFilter] = useState<JobState[]>(initialStateFilter ?? []);
    const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [jobs, setJobs] = useState<GetAllJobsResult | undefined>();
    const [groupByDate, setGroupByDate] = useState(initialGrouped);
    const [contactsCache, setContactsCache] = useState<Record<string, Contact>>({});
    const [loading, setLoading] = useState<boolean>(true);

    const navigate = useNavigate();
    const notifications = useNotifications();

    useEffect(() => {
        console.log(projectId);
        if (!projectId) {
            return;
        }

        setLoading(true);
        let contactsSubject: Subscription;
        const subject = JobsStore.getAllJobs(projectId, {
            onDate: null,
            fromDate: fromDate,
            toDate: toDate,
            states: jobStateFilter,
            page: page,
            pageSize: pageSize
        }).subscribe({
            next: jobs => {
                setJobs(jobs);
                const contactIdsOfJobs = jobs.jobs.map((job) => job.contactId);
                contactsSubject = ContactsStore.getContactsByIds(projectId, contactIdsOfJobs).subscribe({
                    next: contacts => {
                        if (!contacts) {
                            return;
                        }

                        setContactsCache(prevContacts => ({
                            ...prevContacts,
                            ...contacts.reduce<Record<string, Contact>>((acc, contact) => {
                                acc[contact.id] = contact;
                                return acc;
                            }, {})
                        }));
                        setLoading(false);
                    },
                    error: err => {
                        notifications.show("Es gab ein Problem beim Laden der Kontakte.", { severity: "error", autoHideDuration: 3000 });
                        console.error(err);
                        setLoading(false);
                    }
                });
            },
            error: err => {
                notifications.show("Es gab ein Problem beim Laden der Aufträge.", { severity: "error", autoHideDuration: 3000 });
                console.error(err);
                setLoading(false);
            }
        });

        return () => {
            subject.unsubscribe();
            if (contactsSubject) {
                contactsSubject.unsubscribe();
            }
        };
    }, [projectId, page, pageSize, fromDate, toDate, jobStateFilter]);

    useEffect(() => {
        onUpdate(selectedJobs);
    }, [selectedJobs, onUpdate]);

    function handleSelectJob(jobId: string) {
        setSelectedJobs((prev) => {
            const newSelection = prev.includes(jobId)
                ? prev.filter((id) => id !== jobId)
                : [...prev, jobId];
            return newSelection;
        });
    }

    function getContactById(id: string) {
        return contactsCache[id];
    }

    const stateColor = (state: JobState) => {
        switch (state) {
            case JobState.completed:
                return "success";
            case JobState.pending:
                return "info";
            case JobState.inProgress:
                return "primary";
            case JobState.cancelled:
                return "error";
            default:
                return "default";
        }
    };

    const getStateStyle = (state: JobState) => {
        switch (state) {
            case JobState.completed:
                return {
                    backgroundColor: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.main,
                    borderColor: alpha(theme.palette.success.main, 0.3)
                };
            case JobState.pending:
                return {
                    backgroundColor: alpha(theme.palette.info.main, 0.1),
                    color: theme.palette.info.main,
                    borderColor: alpha(theme.palette.info.main, 0.3)
                };
            case JobState.inProgress:
                return {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    borderColor: alpha(theme.palette.primary.main, 0.3)
                };
            case JobState.cancelled:
                return {
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.main,
                    borderColor: alpha(theme.palette.error.main, 0.3)
                };
            default:
                return {
                    backgroundColor: alpha(theme.palette.grey[500], 0.1),
                    color: theme.palette.grey[500],
                    borderColor: alpha(theme.palette.grey[500], 0.3)
                };
        }
    };

    const getAlertDatePart = () => {
        if (initialFromDate && initialToDate) {
            return ` im Zeitraum ${format(initialFromDate, "dd.MM.yyyy")} - ${format(initialToDate, "dd.MM.yyyy")}`;
        } else if (initialFromDate) {
            return ` am ${format(initialFromDate, "dd.MM.yyyy")}`;
        } else if (initialToDate) {
            return ` am ${format(initialToDate, "dd.MM.yyyy")}`;
        }
        return "";
    };

    const getAlertStatePart = () => {
        if (initialStateFilter) {
            return ` mit einem der Zustände ${initialStateFilter.map((state: JobState) => JobStateLabels[state]).join(", ")}`;
        }
        return "";
    };

    const groupedJobs = useMemo(() => {
        if (!jobs) {
            return;
        }

        if (!groupByDate) {
            return [{ date: null, jobs: jobs.jobs }];
        }

        const jobsByDate: Record<string, typeof jobs.jobs> = {};

        console.log("jobs", jobs.jobs);

        jobs.jobs.forEach((job) => {
            const key = format(job.onDate, "dd.MM.yyyy");
            if (key in jobsByDate) {
                jobsByDate[key].push(job);
            } else {
                jobsByDate[key] = [job];
            }
        });

        console.log("jobsByDate", jobsByDate);

        return Object.entries(jobsByDate).map(([date, jobs]) => ({
            date,
            jobs,
        }));
    }, [jobs, groupByDate]);

    if (!projectId) {
        return <Navigate to="/projects" />;
    }

    function handleClickOnDateGroup(checked: boolean, jobs: Job[]) {
        if (checked) {
            setSelectedJobs((prev) => {
                const newSet = new Set(prev);
                jobs.forEach((job) => newSet.add(job.id));
                const newSelection = Array.from(newSet);
                return newSelection;
            });
        } else {
            setSelectedJobs((prev) => {
                const newSet = new Set(prev);
                jobs.forEach((job) => newSet.delete(job.id));
                const newSelection = Array.from(newSet);
                return newSelection;
            });
        }
    }

    return (
        <Paper elevation={0} sx={{ borderRadius: 2, overflow: "hidden"}}>
            {loading && <LinearProgress sx={{ height: 3 }} />}

            {showDateFilter || showStateFilter ? (
                <Paper
                    elevation={0}
                    variant="outlined"
                    sx={{
                        mb: 2,
                        p: 2,
                        borderRadius: 1
                    }}
                >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            flexWrap: 'wrap',
                            gap: 2,
                            width: '100%'
                        }}>
                            {showDateFilter && (
                                <>
                                    <Box sx={{
                                        flexGrow: 1,
                                        minWidth: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 12px)' }
                                    }}>
                                        <DatePicker
                                            label="Von"
                                            value={fromDate}
                                            onChange={(newDate) => setFromDate(newDate)}
                                            format="dd.MM.yyyy"
                                            slotProps={{
                                                textField: {
                                                    size: 'small',
                                                    fullWidth: true,
                                                    InputProps: {
                                                        startAdornment: (
                                                            <CalendarTodayIcon
                                                                fontSize="small"
                                                                sx={{ mr: 1, color: theme.palette.action.active }}
                                                            />
                                                        )
                                                    }
                                                }
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{
                                        flexGrow: 1,
                                        minWidth: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 12px)' }
                                    }}>
                                        <DatePicker
                                            label="Bis"
                                            value={toDate}
                                            onChange={(newDate) => setToDate(newDate)}
                                            format="dd.MM.yyyy"
                                            slotProps={{
                                                textField: {
                                                    size: 'small',
                                                    fullWidth: true,
                                                    InputProps: {
                                                        startAdornment: (
                                                            <CalendarTodayIcon
                                                                fontSize="small"
                                                                sx={{ mr: 1, color: theme.palette.action.active }}
                                                            />
                                                        )
                                                    }
                                                }
                                            }}
                                        />
                                    </Box>
                                </>
                            )}

                            {showStateFilter && (
                                <Box sx={{
                                    flexGrow: 1,
                                    minWidth: {
                                        xs: '100%',
                                        sm: showDateFilter ? '100%' : 'calc(50% - 8px)',
                                        md: showDateFilter ? 'calc(50% - 8px)' : 'calc(25% - 12px)'
                                    }
                                }}>
                                    <FormControl size="small" fullWidth>
                                        <Select
                                            multiple
                                            displayEmpty
                                            value={jobStateFilter}
                                            onChange={(e) => {
                                                const { target: { value } } = e;
                                                setJobStateFilter(
                                                    typeof value === 'string'
                                                        ? value.split(',').map((v) => JobState[v])
                                                        : value
                                                );
                                            }}
                                            renderValue={(selected) => {
                                                if (selected.length === 0) {
                                                    return 'Status';
                                                }
                                                return selected.map(s => JobStateLabels[s]).join(', ');
                                            }}
                                        >
                                            <MenuItem value={JobState.pending}>ausstehend</MenuItem>
                                            <MenuItem value={JobState.inProgress}>in Bearbeitung</MenuItem>
                                            <MenuItem value={JobState.completed}>abgeschlossen</MenuItem>
                                            <MenuItem value={JobState.cancelled}>abgebrochen</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                            )}
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                            <Button
                                variant={groupByDate ? "contained" : "outlined"}
                                size="small"
                                color={groupByDate ? "primary" : "inherit"}
                                onClick={() => setGroupByDate(!groupByDate)}
                                startIcon={<CalendarTodayIcon fontSize="small" />}
                                sx={{
                                    borderRadius: '4px',
                                    px: 2,
                                    bgcolor: groupByDate ? undefined : 'transparent',
                                    borderColor: groupByDate ? undefined : theme.palette.divider,
                                    color: groupByDate ? undefined : theme.palette.text.primary,
                                    '&:hover': {
                                        bgcolor: groupByDate ? undefined : alpha(theme.palette.primary.main, 0.05),
                                        borderColor: groupByDate ? undefined : theme.palette.divider
                                    }
                                }}
                            >
                                Nach Datum gruppieren
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            ) : null}

            {jobs && jobs.jobs.length === 0 && showNoJobsWarning ? (
                <Box sx={{ p: 3 }}>
                    <Alert
                        severity="warning"
                        sx={{
                            borderRadius: 1,
                            '& .MuiAlert-message': { display: 'flex', alignItems: 'center' }
                        }}
                        action={
                            <Button
                                variant="outlined"
                                color="warning"
                                size="small"
                                onClick={() => navigate(`/projects/${projectId}/jobs`)}
                            >
                                Auftrag erstellen
                            </Button>
                        }
                    >
                        Es gibt keinen Auftrag{getAlertDatePart()}{getAlertStatePart()}
                    </Alert>
                </Box>
            ) : (
                <>
                    <TableContainer>
                        <Table size="small">
                            <CustomTableHeader selectable={true}
                                               allSelected={jobs?.jobs.length > 0 &&
                                                            selectedJobs.length > 0 &&
                                                            jobs?.jobs.every((job: Job) => selectedJobs.includes(job.id))}
                                               anySelected={selectedJobs.length > 0 &&
                                                            jobs?.jobs.some((job: Job) => selectedJobs.includes(job.id)) &&
                                                            !jobs?.jobs.every((job: Job) => selectedJobs.includes(job.id))}
                                               onSelected={(newValue: boolean) => {
                                                   if (newValue) {
                                                       setSelectedJobs(jobs ? [...jobs.jobs.map((job) => job.id)] : []);
                                                   } else {
                                                       setSelectedJobs([]);
                                                   }
                                               }}
                                               columns={["Vorname", "Nachname", "Adresse", "Lieferdatum", "Zeitfenster", "Status"]}
                            />
                            <TableBody>
                                {loading || !jobs || !contactsCache ? (
                                    Array.from(new Array(pageSize)).map((_, index) => (
                                        <TableRow key={index}>
                                            {selectable && (
                                                <TableCell padding="checkbox">
                                                    <Checkbox disabled />
                                                </TableCell>
                                            )}
                                            <TableCell><Skeleton variant="text" sx={{ fontSize: '1rem' }} width={100} /></TableCell>
                                            <TableCell><Skeleton variant="text" sx={{ fontSize: '1rem' }} width={100} /></TableCell>
                                            <TableCell><Skeleton variant="text" sx={{ fontSize: '1rem' }} width={150} /></TableCell>
                                            <TableCell><Skeleton variant="text" sx={{ fontSize: '1rem' }} width={80} /></TableCell>
                                            <TableCell><Skeleton variant="text" sx={{ fontSize: '1rem' }} width={120} /></TableCell>
                                            <TableCell><Skeleton variant="text" width={60} /></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    groupedJobs?.map(({ date, jobs: groupJobs }, groupIndex: number) => (
                                        <React.Fragment key={groupIndex}>
                                            {groupByDate && date && (
                                                <TableRow
                                                    onClick={() => {
                                                        const checked = groupJobs.every((job: Job) => selectedJobs.includes(job.id));
                                                        handleClickOnDateGroup(!checked, groupJobs);
                                                    }}
                                                    hover
                                                    sx={{ cursor: 'pointer' }}
                                                >
                                                    <TableCell
                                                        padding="checkbox"
                                                        colSpan={1}
                                                        sx={{
                                                            backgroundColor: theme.palette.mode === 'light'
                                                                ? alpha(theme.palette.primary.main, 0.04)
                                                                : alpha(theme.palette.primary.main, 0.1),
                                                            pl: 2
                                                        }}
                                                    >
                                                        <Checkbox
                                                            checked={groupJobs.every((job: Job) => selectedJobs.includes(job.id))}
                                                            indeterminate={
                                                                groupJobs.some((job: Job) => selectedJobs.includes(job.id)) &&
                                                                !groupJobs.every((job: Job) => selectedJobs.includes(job.id))
                                                            }
                                                            onChange={(event) => handleClickOnDateGroup(event.target.checked, groupJobs)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </TableCell>
                                                    <TableCell
                                                        colSpan={selectable ? 6 : 5}
                                                        sx={{
                                                            backgroundColor: theme.palette.mode === 'light'
                                                                ? alpha(theme.palette.primary.main, 0.04)
                                                                : alpha(theme.palette.primary.main, 0.1),
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                                                            <Typography variant="subtitle1" fontWeight="bold" color="primary.main">{date}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            )}

                                            {groupJobs.map((job: Job) => {
                                                const contact = getContactById(job.contactId);
                                                return (
                                                    <TableRow
                                                        key={job.id}
                                                        hover
                                                        aria-checked={selectedJobs.includes(job.id)}
                                                        selected={selectedJobs.includes(job.id)}
                                                        onClick={() => {
                                                            if (!selectable) return;
                                                            handleSelectJob(job.id);
                                                        }}
                                                        sx={{
                                                            cursor: selectable ? 'pointer' : 'default',
                                                            '&.Mui-selected': {
                                                                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                                                '&:hover': {
                                                                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        {selectable && (
                                                            <TableCell padding="checkbox" sx={{ pl: 2 }}>
                                                                <Checkbox
                                                                    checked={selectedJobs.includes(job.id)}
                                                                    onChange={(e) => {
                                                                        e.stopPropagation();
                                                                        handleSelectJob(job.id);
                                                                    }}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                            </TableCell>
                                                        )}
                                                        <TableCell>{contact?.firstName}</TableCell>
                                                        <TableCell>{contact?.lastName}</TableCell>
                                                        <TableCell sx={{ minWidth: 200 }}>
                                                            <ShortAddressTextField address={contact?.address} />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" fontWeight={500}>
                                                                {format(job.onDate, "dd.MM.yyyy")}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <TimeWindows
                                                                timeWindows={job.timeWindows}
                                                                deletable={false}
                                                                onDelete={() => {}}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={JobStateLabels[job.state] || job.state}
                                                                color={stateColor(job.state)}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{
                                                                    fontWeight: 500,
                                                                    ...getStateStyle(job.state)
                                                                }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </React.Fragment>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <CustomTablePagination onPageChange={(page: number) => setPage(page)}
                                           onPageSizeChange={(pageSize: number) => setPageSize(pageSize)}
                                           itemName={"Aufträge"}
                                           totalCount={jobs?.totalCount ?? 0}
                                           selectedCount={selectedJobs.length}
                    />
                </>
            )}
        </Paper>
    );
};

export default JobsTable;
